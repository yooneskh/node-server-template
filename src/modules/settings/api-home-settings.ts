import { SettingResourceMaker } from '../../plugins/setting-resource-maker/setting-resource-maker';
import { IApiHomeSetting, IApiHomeSettingBase } from './settings-interfaces';

const maker = new SettingResourceMaker<IApiHomeSettingBase, IApiHomeSetting>('ApiHomeSetting');

maker.addProperties([
  {
    key: 'bottomGuides',
    type: 'string',
    isArray: true,
    ref: 'Guide',
    title: 'راهنماهای انتهایی',
  },
  {
    key: 'loginGuide',
    type: 'string',
    ref: 'Guide',
    title: 'راهنمایی صفحه ورود',
  },
  {
    key: 'apiRequestGuide',
    type: 'string',
    ref: 'Guide',
    title: 'راهنمایی درخواست Api',
  },
]);

export const ApiHomeSettingController = maker.getController();

maker.addActions([
  {
    ...maker.getRouteActionRetrieve()
  },
  {
    ...maker.getRouteActionUpdate(),
    permissions: ['admin.setting.api.home']
  }
]);

export const ApiHomeSettingRouter = maker.getRouter();
