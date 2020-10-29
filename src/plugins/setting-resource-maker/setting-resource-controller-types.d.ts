
export interface SettingResourceControllerContext<T> {
  selects?: string;
  includes?: Record<string, string>;
  payload?: Partial<T>;
}
