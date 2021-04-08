import { SettingResourceMaker } from '../../plugins/setting-resource-maker/setting-resource-maker';
import { IApplicationSetting, IApplicationSettingBase } from './settings-interfaces';

const maker = new SettingResourceMaker<IApplicationSettingBase, IApplicationSetting>('ApplicationSetting');

maker.addProperties([
  {
    key: 'manager',
    type: 'string',
    ref: 'User',
    title: 'مدیر برنامه'
  }
]);

export const ApplicationSettingController = maker.getController();

maker.addActions([
  {
    ...maker.getRouteActionRetrieve()
  },
  {
    ...maker.getRouteActionUpdate(),
    permissions: ['admin.setting.application']
  }
]);

export const ApplicationSettingRouter = maker.getRouter();
