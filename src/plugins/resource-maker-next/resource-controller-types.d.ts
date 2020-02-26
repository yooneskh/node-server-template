export interface ResourceControllerContext<T> {
  resourceId?: Record<string, any>;
  includes?: Record<string, string>;
  sorts?: Record<string, number>;
  filters?: Record<string, any>;
  payload?: Partial<T>;
  selects?: string;
  limit?: number;
  skip?: number;
  query?: any;
}