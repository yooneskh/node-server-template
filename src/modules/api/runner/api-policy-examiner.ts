import { HandleableError, ServerError } from '../../../global/errors';
import { getAccountForUser, getApiConsumeAccount } from '../../accounting/account-resource';
import { createTransfer } from '../../accounting/transfer-resource';
import { IApiDurations, IApiLogBase, IApiPermit, IApiPolicy } from '../api-interfaces';
import { ApiLogController } from '../api-log-resource';
import { ApiPolicyController } from '../api-policy-resource';


interface IPolicyExaminationResult {
  passed: boolean;
  error?: HandleableError,
  logs: Partial<IApiLogBase>,
  headers: Record<string, unknown>
}


class RateLimitExceededError extends HandleableError {
  public code = 2001;
  public statusCode = 429;
}


function mapDurationLabelToMillis(duration: IApiDurations): number {
  switch (duration) {
    case 'second': return 1000;           // 1000;
    case 'minute': return 60_000;         // 1000 * 60;
    case 'hour':   return 3_600_000;      // 1000 * 60 * 60;
    case 'day':    return 86_400_000;     // 1000 * 60 * 60 * 24;
    case 'week':   return 604_800_000;    // 1000 * 60 * 60 * 24 * 7;
    case 'month':  return 2_592_000_000;  // 1000 * 60 * 60 * 24 * 30;
    case 'year':   return 31_536_000_000; // 1000 * 60 * 60 * 24 * 365;
    default: throw new ServerError('invalid duration specified.', 'میزان دوره تعریف نشده است.');
  }
}

async function examineRateLimit(permit: IApiPermit, policy: IApiPolicy): Promise<IPolicyExaminationResult> {

  const durationMillis = mapDurationLabelToMillis(policy.rateLimitDuration) * policy.rateLimitDurationMultiplier;
  const durationWindowStart = Date.now() - durationMillis;

  const callCount = await ApiLogController.count({
    filters: { // todo: count only successful calls?
      permit: permit._id,
      createdAt: { $gte: durationWindowStart }
    }
  });

  const passed = callCount < policy.rateLimitPoints;

  return {
    passed,
    error: passed ? undefined : new RateLimitExceededError('rate limit exceeded.', 'میزان فراخوانی شما بیش از اندازه است.'),
    logs: {
      rateLimitRemainingPoints: policy.rateLimitPoints - callCount
    },
    headers: {
      'Retry-After': Math.ceil(durationMillis / 1000),
      'X-RateLimit-Limit': policy.rateLimitPoints,
      'X-RateLimit-Remaining': policy.rateLimitPoints - callCount,
      'X-RateLimit-Reset': String(new Date( Date.now() + durationMillis ))
    }
  };

}

async function examinePayment(permit: IApiPermit, policy: IApiPolicy): Promise<IPolicyExaminationResult> {

  if (policy.paymentFreeSessionType !== 'none') {

    const intervalDuration = mapDurationLabelToMillis(policy.paymentFreeSessionInterval!) * policy.paymentFreeSessionIntervalCount!;

    if (!( policy.paymentFreeSessionType === 'oneTime' && Date.now() > (permit.createdAt + intervalDuration) )) {

      let windowStart = 0;
      let windowEnd = 0;

      if (policy.paymentFreeSessionType === 'oneTime') {
        windowStart = permit.createdAt;
        windowEnd = permit.createdAt + intervalDuration;
      }
      else if (policy.paymentFreeSessionType === 'interval') {
        windowStart = Date.now() - intervalDuration;
        windowEnd = Date.now();
      }

      const callCount = await ApiLogController.count({
        filters: { // todo: count only successful calls?
          permit: permit._id,
          createdAt: {
            $gte: windowStart,
            $lte: windowEnd
          }
        }
      });

      if (callCount <= policy.paymentFreeSessionRequests!) {
        return {
          passed: true,
          logs: {
            cost: 0
          },
          headers: {
            'x-opendata-cost': 0,
            'x-opendata-free-remaining': callCount - policy.paymentFreeSessionRequests!,
            'x-opendata-free-reset': policy.paymentFreeSessionType === 'interval' ? String(new Date( Date.now() + intervalDuration )) : undefined,
            'x-opendata-free-until': policy.paymentFreeSessionType === 'oneTime' ? String(new Date( windowEnd )) : undefined
          }
        };
      }

    }

  }

  const [userAccount, apiConsumeAccount] = await Promise.all([
    getAccountForUser(permit.user),
    getApiConsumeAccount()
  ]);

  try {

    const transfer = await createTransfer(userAccount._id, apiConsumeAccount._id, policy.paymentRequestCost);

    return {
      passed: true,
      logs: {
        cost: policy.paymentRequestCost,
        costTransfer: transfer._id
      },
      headers: {
        'x-opendata-cost': policy.paymentRequestCost
      }
    }

  }
  catch (error: any) {
    return {
      passed: false,
      error,
      logs: {
        cost: -1
      },
      headers: {

      }
    }
  }

}


export async function examineApiPolicy(permit: IApiPermit, policyId: string): Promise<IPolicyExaminationResult> {

  const policy = await ApiPolicyController.retrieve({ resourceId: policyId });
  const result: IPolicyExaminationResult = { passed: true, logs: {}, headers: {} };
  const resultsBag: IPolicyExaminationResult[] = [];

  if (policy.hasRateLimit) {
    const rateLimitResult = await examineRateLimit(permit, policy);
    if (!rateLimitResult.passed) return rateLimitResult;
    resultsBag.push(rateLimitResult);
  }

  if (policy.hasPaymentConfig) {
    const paymentResult = await examinePayment(permit, policy);
    if (!paymentResult.passed) return paymentResult;
    resultsBag.push(paymentResult);
  }

  for (const item of resultsBag) {
    result.passed = result.passed && item.passed;
    Object.assign(result.logs, item.logs);
    Object.assign(result.headers, item.headers);
  }

  return result;

}
