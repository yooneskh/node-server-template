export interface ResourceOptions {
  name: string;
  properties: ResourceProperty[],
  relations?: ResourceRelation[]
}

export interface ResourceProperty {
  key: string;
  type: string;
  ref?: string;
}

export interface ResourceRelation {
  targetModelName: string;
  relationModelName?: string;
  properties?: ResourceProperty[]
}
