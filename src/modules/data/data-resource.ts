import { IData, IDataBase } from './data-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IDataBase, IData>('Data');

maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'category',
    type: 'string',
    ref: 'DataCategory',
    required: true,
    index: true,
    title: 'دسته‌بندی'
  },
  {
    key: 'description',
    type: 'string',
    title: 'توضیحات',
    longText: true,
    hideInTable: true
  },
  {
    key: 'type',
    type: 'string',
    enum: ['file', 'image'],
    required: true,
    title: 'نوع',
    items: [
      { value: 'file', text: 'فایل' },
      { value: 'image', text: 'تصویر' }
    ]
  },
  {
    key: 'file',
    type: 'string',
    ref: 'Media',
    required: true,
    title: 'فایل'
  },
  {
    key: 'showAllImage',
    type: 'boolean',
    title: 'نمایش همه تصویر'
  }
]);

export const DataModel      = maker.getModel();
export const DataController = maker.getController();

maker.addActions([
  { template: 'LIST' },//, permissions: ['admin.data.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.data.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.data.retrieve'] },
  { template: 'CREATE', permissions: ['admin.data.create'] },
  { template: 'UPDATE', permissions: ['admin.data.update'] },
  { template: 'DELETE', permissions: ['admin.data.delete'] },
  { // search
    method: 'GET',
    path: '/search/:query',
    signal: ['Resource', 'Data', 'Search'],
    dataProvider: async ({ request: { params: { query } } }) => {
      return DataController.list({
        filters: {
          $or: [
            {
              title: { $regex: new RegExp(query, 'i') }
            },
            {
              description: { $regex: new RegExp(query, 'i') }
            }
          ]
        },
        includes: {
          'file': ''
        },
        skipKeyCheck: true
      });
    }
  }
]);

export const DataRouter = maker.getRouter();
