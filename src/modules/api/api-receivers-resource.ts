import { IApiReceiver, IApiReceiverBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiReceiverBase, IApiReceiver>('ApiReceiver');


maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان'
  },
  {
    key: 'parent',
    type: 'string',
    ref: 'ApiReceiver',
    title: 'بالادست'
  }
]);


export const ApiReceiverModel      = maker.getModel();
export const ApiReceiverController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-receiver.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-receiver.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-receiver.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-receiver.create'] },
  { template: 'UPDATE', permissions: ['admin.api-receiver.update'] },
  { template: 'DELETE', permissions: ['admin.api-receiver.delete'] }
]);


export const ApiReceiverRouter = maker.getRouter();
