export interface ResourceOptions {
  name: string;
  properties: ResourceProperty[]
}

export interface ResourceProperty {
  key: string;
  type: string;
}