export interface ResourceOptions {
  name: string;
  properties: ResourceProperty[]
}

export interface ResourceProperty {
  key: string;
  type: string;
  ref?: string;
}

export interface ResourceRelation {
  modelName: string;
  property: string;
}
