import { HandleableError, ServerError } from '../../../global/errors';
import { IApiLogBase, IApiPermit } from '../api-interfaces';
import { ApiLogController } from '../api-log-resource';
import { ApiPolicyController } from '../api-policy-resource';
import { ApiRateLimitConfigController } from '../api-rate-limit-config-resource';


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


function mapDurationLabelToMillis(duration: string): number {
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

async function examineRateLimit(permit: IApiPermit, rateLimitConfigId: string): Promise<IPolicyExaminationResult> {

  const rateLimitConfig = await ApiRateLimitConfigController.retrieve({ resourceId: rateLimitConfigId });

  const durationMillis = mapDurationLabelToMillis(rateLimitConfig.duration) * rateLimitConfig.durationMultiplier;
  const durationWindowStart = Date.now() - durationMillis;

  const callCount = await ApiLogController.count({
    filters: { // todo: count only successful calls?
      permit: permit._id,
      createdAt: { $gte: durationWindowStart }
    }
  });

  const passed = callCount > rateLimitConfig.points;

  return {
    passed,
    error: passed ? undefined : new RateLimitExceededError('rate limit exceeded.', 'میزان فراخوانی شما بیش از اندازه است.'),
    logs: {
      rateLimitRemainingPoints: rateLimitConfig.points - callCount
    },
    headers: {
      'Retry-After': Math.ceil(durationMillis / 1000),
      'X-RateLimit-Limit': rateLimitConfig.points,
      'X-RateLimit-Remaining': rateLimitConfig.points - callCount,
      'X-RateLimit-Reset': String(new Date( Date.now() + durationMillis ))
    }
  };

}


export async function examineApiPolicy(permit: IApiPermit, /* api: IApiVersion,  */ policyId: string): Promise<IPolicyExaminationResult> {

  const policy = await ApiPolicyController.retrieve({ resourceId: policyId });
  const result: IPolicyExaminationResult = { passed: false, logs: {}, headers: {} };
  const resultsBag: IPolicyExaminationResult[] = [];

  if (policy.rateLimitConfig) {
    const rateLimitResult = await examineRateLimit(permit, policy.rateLimitConfig);
    if (!rateLimitResult.passed) return rateLimitResult;
    resultsBag.push(rateLimitResult);
  }

  for (const item of resultsBag) {
    result.passed = result.passed && item.passed;
    Object.assign(result.logs, item.logs);
    Object.assign(result.headers, item.headers);
  }

  return result;

}
