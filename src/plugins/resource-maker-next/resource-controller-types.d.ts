export interface ResourceControllerContext {
  filters?: Record<string, any>;
  sorts?: Record<string, number>;
  includes?: Record<string, string>;
  selects?: string;
  limit?: number;
  skip?: number;
}