export interface ResourceModelProperty {
  key: string;
  type: string;
  ref?: string;
  default?: any;
  required?: boolean;
  unique?: boolean;
  select?: boolean;
  isArray?: boolean;
  languages?: Record<string, any>;
  serieSchema?: ResourceModelProperty[];
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
}

export interface IResource {
  createdAt: number;
  updatedAt: number;
}