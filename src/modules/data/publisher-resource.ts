import { IPublisher, IPublisherBase } from './data-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IPublisherBase, IPublisher>('Publisher');


maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'logo',
    type: 'string',
    ref: 'Media',
    title: 'لوگو',
  },
]);


export const PublisherModel      = maker.getModel();
export const PublisherController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.publisher.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.publisher.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.publisher.retrieve'] },
  { template: 'CREATE', permissions: ['admin.publisher.create'] },
  { template: 'UPDATE', permissions: ['admin.publisher.update'] },
  { template: 'DELETE', permissions: ['admin.publisher.delete'] }
]);


export const PublisherRouter = maker.getRouter();
