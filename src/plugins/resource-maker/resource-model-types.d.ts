export type SimpleCompoundIndex = { [key: string]: 1 | -1 };

export type FullCompoundIndex = {
  indexes: SimpleCompoundIndex;
  options: Record<string, any>;
};

export type CompoundIndex = SimpleCompoundIndex | FullCompoundIndex

export interface ResourceModelProperty {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'any' | 'series';
  ref?: string;
  default?: any;
  required?: boolean;
  select?: boolean;
  enum?: string[];
  isArray?: boolean;
  languages?: Record<string, any>;
  serieSchema?: ResourceModelProperty[];
  // index
  index?: boolean | { unique?: boolean; sparse?: boolean };
  unique?: boolean;
  sparse?: boolean;
  // metas
  title?: string;
  titleable?: boolean;
  hidden?: boolean;
  hideInTable?: boolean;
  dir?: string;
  longText?: boolean;
  richText?: boolean;
  timeFormat?: string;
  relationSourceModel?: string;
  relationTargetModel?: string;
  serieBase?: any;
  width?: number;
  itemWidth?: number;
  disabled?: boolean;
  readonly?: boolean;
  labelFormat?: string;
  valueFormat?: string;
  items?: { value: string, text: string }[];
  handlerElement?: string;
}

export interface IResource {
  createdAt: number;
  updatedAt: number;
}
