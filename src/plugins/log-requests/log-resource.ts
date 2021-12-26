import { ILogService, ILogServiceBase } from './log-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<ILogServiceBase, ILogService>('Log');


maker.addProperties([
     {
    key: 'user',
    type: 'string',
    ref: 'User',
    title: 'کاربر',
    hideInTable: true
  },
   {
    key: 'time',
    type: 'string',
    title: 'زمان',
    hideInTable: true
  },
   {
    key: 'document',
    type: 'string',
    title: 'سند',
    hideInTable: true
  },
   {
    key: 'data',
    type: 'object',
    title: 'اطلاعات',
    hideInTable: true
  }, {
    key: 'action',
    type: 'string',
    title: 'عملیات ',
    hideInTable: true
  }
]);


export const ApiLogModel      = maker.getModel();
export const ApiLogController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-log.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-log.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-log.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-log.create'] },
  { template: 'UPDATE', permissions: ['admin.api-log.update'] },
  { template: 'DELETE', permissions: ['admin.api-log.delete'] }
]);


export const ApiLogRouter = maker.getRouter();
