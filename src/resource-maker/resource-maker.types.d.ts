export interface ResourceOptions {
  name: string;
  properties: ResourceProperty[],
  relations: ResourceRelation[]
}

export interface ResourceProperty {
  key: string;
  type: string;
}

export interface ResourceRelation {
  modelName: string;
  property: string;
}
