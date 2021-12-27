import { ILog, ILogBase } from './log-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<ILogBase, ILog>('Log');


maker.addProperties([
  {
    key: 'user',
    type: 'string',
    ref: 'User',
    title: 'کاربر'
  },
  {
    key: 'document',
    type: 'string',
    required: true,
    title: 'سند',
  },
  {
    key: 'data',
    type: 'object',
    title: 'اطلاعات',
    hideInTable: true
  },
  {
    key: 'action',
    type: 'string',
    title: 'عملیات ',
  }
]);


export const LogModel      = maker.getModel();
export const LogController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.log.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.log.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.log.retrieve'] },
  { template: 'CREATE', permissions: ['admin.log.create'] },
  { template: 'UPDATE', permissions: ['admin.log.update'] },
  { template: 'DELETE', permissions: ['admin.log.delete'] }
]);


export const LogRouter = maker.getRouter();
