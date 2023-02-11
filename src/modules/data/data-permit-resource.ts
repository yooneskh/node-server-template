import { IDataPermit, IDataPermitBase } from './data-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IDataPermitBase, IDataPermit>('DataPermit');


maker.addProperties([
  { // user
    key: 'user',
    type: 'string',
    ref: 'User',
    title: 'کاربر',
    titleable: true
  },
  { // data
    key: 'data',
    type: 'string',
    ref: 'Data',
    required: true,
    title: 'داده',
    titleable: true
  },
]);


export const DataPermitModel      = maker.getModel();
export const DataPermitController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', /* permissions: ['admin.data-permit.list']  */},
  { template: 'LIST_COUNT', /* permissions: ['admin.data-permit.list-count']  */},
  { template: 'RETRIEVE', /* permissions: ['admin.data-permit.retrieve']  */},
  { template: 'CREATE', permissions: ['admin.data-permit.create'] },
  { template: 'UPDATE', permissions: ['admin.data-permit.update'] },
  { template: 'DELETE', permissions: ['admin.data-permit.delete'] },
]);


export const DataPermitRouter = maker.getRouter();
