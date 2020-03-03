export interface ResourceRelationControllerContext<T> {
  relationId?: string;
  sourceId?: string;
  targetId?: string;
  includes?: Record<string, string>;
  sorts?: Record<string, number>;
  filters?: Record<string, any>;
  payload?: Partial<T>;
  selects?: string;
  limit?: number;
  skip?: number;
  query?: any;
}