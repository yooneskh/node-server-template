import { ResourceRouter } from '../resource-maker/resource-router';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { RouteBypassedError } from '../../global/errors';
import { RateLimiterOption } from './rate-limiter-types';

const rateLimiters = new Map<string, RateLimiterMemory>();
let globalRateLimitOption: RateLimiterOption | undefined = undefined;

export function setGlobalRateLimitOption(option: RateLimiterOption) {
  globalRateLimitOption = option;
}

ResourceRouter.addPreProcessor(async ({ action, request, response }) => {

  const rateLimit = action.rateLimitOptions ?? globalRateLimitOption;
  if (!rateLimit) return;

  const actionSignal = action.signal?.join('-')!;

  if (!rateLimiters.has(actionSignal)) {
    rateLimiters.set(
      actionSignal,
      new RateLimiterMemory({
        points: rateLimit.pointsAmount,
        duration: rateLimit.pointsInterval,
        blockDuration: rateLimit.blockDuration
      })
    );
  }

  try {

    const key = request.headers['x-forwarded-for'] as string || request.connection.remoteAddress || '---';
    const rateLimitResult = await rateLimiters.get(actionSignal)!.consume(key);

    response.setHeader('X-RateLimit-Limit', rateLimit.pointsAmount);
    response.setHeader('X-RateLimit-Remaining', rateLimitResult.remainingPoints);
    response.setHeader('X-RateLimit-Reset', String(new Date(Date.now() + rateLimitResult.msBeforeNext)));

  }
  catch (error) {

    const rateLimitResult = error as RateLimiterRes;

    response.setHeader('Retry-After', Math.ceil(rateLimitResult.msBeforeNext / 1000));
    response.setHeader('X-RateLimit-Limit', rateLimit.pointsAmount);
    response.setHeader('X-RateLimit-Remaining', rateLimitResult.remainingPoints);
    response.setHeader('X-RateLimit-Reset', String(new Date(Date.now() + rateLimitResult.msBeforeNext)));

    response.status(429).send('Too Many Requests').end();
    throw new RouteBypassedError('too many requests', 'تعداد درخواست‌های شما از حد مجاز فراتر رفته است.');

  }

});
