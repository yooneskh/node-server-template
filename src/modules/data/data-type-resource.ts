import { IDataType, IDataTypeBase } from './data-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IDataTypeBase, IDataType>('DataType');

maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'viewType',
    type: 'string',
    enum: ['card', 'containedImageCard', 'table'],
    required: true,
    title: 'نحوه نمایش',
    items: [
      { value: 'card', text: 'کارتی' },
      { value: 'containedImageCard', text: 'کارت با نمایش تصویر کامل' },
      { value: 'table', text: 'جدولی' }
    ]
  },
  {
    key: 'emptyIcon',
    type: 'string',
    ref: 'Media',
    required: true,
    title: 'آیکن خالی'
  }
]);

export const DataTypeModel      = maker.getModel();
export const DataTypeController = maker.getController();

maker.setValidations({ });

maker.addActions([
  { template: 'LIST', permissions: ['admin.data-type.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.data-type.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.data-type.retrieve'] },
  { template: 'CREATE', permissions: ['admin.data-type.create'] },
  { template: 'UPDATE', permissions: ['admin.data-type.update'] },
  { template: 'DELETE', permissions: ['admin.data-type.delete'] }
]);

export const DataTypeRouter = maker.getRouter();
