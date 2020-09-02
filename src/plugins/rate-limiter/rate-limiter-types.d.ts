import '../../modules/modules-interfaces';

interface RateLimiterOption {
  pointsAmount: number;
  pointsInterval: number;
  blockDuration: number;
  consecutiveFailDurationMultiplier: number;
}

declare module '../../plugins/resource-maker/resource-router-types' {
  interface ResourceRouterAction {
    rateLimitOptions?: RateLimiterOption;
  }
}
