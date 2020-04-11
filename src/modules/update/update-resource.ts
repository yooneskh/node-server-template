import { IUpdateBase } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-router-enums';


const maker = new ResourceMaker<IUpdateBase>('Update');

maker.addProperties([
  {
    key: 'title',
    type: 'string',
    title: 'عنوان',
    required: true,
    titleable: true
  },
  {
    key: 'description',
    type: 'string',
    title: 'توضیحات',
    required: true
  },
  {
    key: 'changes',
    type: 'string',
    title: 'تغییرات',
    required: true
  },
  {
    key: 'version',
    type: 'string',
    title: 'شماره نسخه',
    required: true,
    titleable: true
  },
  {
    key: 'platform',
    type: 'string',
    title: 'پلتفرم',
    required: true,
    titleable: true
  },
  {
    key: 'mandatory',
    type: 'string',
    title: 'اجباری',
    default: false
  },
  {
    key: 'links',
    type: 'string',
    title: 'لینک‌ها',
    required: true
  }
]);

export const UpdateModel      = maker.getModel();
export const UpdateController = maker.getController();


maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const UpdateRouter = maker.getRouter();
