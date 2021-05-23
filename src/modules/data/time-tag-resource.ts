import { ITimeTag, ITimeTagBase } from './data-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<ITimeTagBase, ITimeTag>('TimeTag');

maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  }
]);

export const TimeTagModel      = maker.getModel();
export const TimeTagController = maker.getController();

maker.setValidations({ });

maker.addActions([
  { template: 'LIST', permissions: ['admin.time-tag.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.time-tag.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.time-tag.retrieve'] },
  { template: 'CREATE', permissions: ['admin.time-tag.create'] },
  { template: 'UPDATE', permissions: ['admin.time-tag.update'] },
  { template: 'DELETE', permissions: ['admin.time-tag.delete'] }
]);

export const TimeTagRouter = maker.getRouter();
