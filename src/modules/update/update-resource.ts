import { IUpdateBase } from './update-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


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
    required: true,
    isArray: true
  },
  {
    key: 'version',
    type: 'number',
    index: true,
    title: 'شماره نسخه',
    required: true,
    titleable: true
  },
  {
    key: 'platform',
    type: 'string',
    index: true,
    title: 'پلتفرم',
    required: true,
    titleable: true
  },
  {
    key: 'packageName',
    type: 'string',
    index: true,
    title: 'نام پکیج',
    required: true,
    titleable: true
  },
  {
    key: 'mandatory',
    type: 'boolean',
    title: 'اجباری',
    default: false
  },
  {
    key: 'links',
    type: 'string',
    title: 'لینک‌ها',
    required: true,
    isArray: true
  }
]);

export const UpdateModel      = maker.getModel();
export const UpdateController = maker.getController();


maker.addActions([
  { template: 'LIST', permissions: ['admin.update.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.update.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.update.retrieve'] },
  { template: 'CREATE', permissions: ['admin.update.create'] },
  { template: 'UPDATE', permissions: ['admin.update.update'] },
  { template: 'DELETE', permissions: ['admin.update.delete'] }
]);

export const UpdateRouter = maker.getRouter();
