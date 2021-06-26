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
    key: 'timeTags',
    type: 'string',
    ref: 'TimeTag',
    isArray: true,
    required: true,
    title: 'تگ‌های زمانی',
    hideInTable: true
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
    ref: 'DataType',
    required: true,
    title: 'نوع'
  },
  {
    key: 'file',
    type: 'string',
    ref: 'Media',
    required: true,
    title: 'فایل'
  },
  {
    key: 'publisher',
    type: 'string',
    ref: 'Publisher',
    title: 'انتشار دهنده'
  },
  {
    key: 'tags',
    type: 'string',
    isArray: true,
    title: 'کلمات کلیدی',
    hideInTable: true
  },
  {
    key: 'hidden',
    type: 'boolean',
    title: 'مخفی کردن داده',
    hideInTable: true
  },
  {
    key: 'hideMetas',
    type: 'boolean',
    title: 'مخفی کردن اطلاعات',
    hideInTable: true
  }
]);


export const DataModel      = maker.getModel();
export const DataController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST' },
  { template: 'LIST_COUNT' },
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
            },
            {
              tags: { $regex: new RegExp(query, 'i') }
            }
          ]
        },
        includes: {
          'timeTags': '',
          'type': '',
          'type.emptyIcon': 'path',
          'type.smallIcon': 'path',
          'file': '',
          'publisher': ''
        },
        skipKeyCheck: true
      });
    }
  },
  { // search
    method: 'GET',
    path: '/custom/search',
    signal: ['Resource', 'Data', 'SearchCustom'],
    dataProvider: async ({ query }) => {

      const { title, description, timeTags, publisher, tags } = query;

      // tslint:disable-next-line: no-any
      const filters: any = {};

      if (title) {
        filters['title'] = { $regex: new RegExp(title, 'i') };
      }

      if (description) {
        filters['description'] = { $regex: new RegExp(description, 'i') };
      }

      if (publisher) {
        filters['publisher'] = publisher;
      }

      if (timeTags) {
        filters['timeTags'] = timeTags.split(',');
      }

      if (tags) {
        filters['tags'] = tags.split(',');
      }

      return DataController.list({
        filters,
        includes: {
          'timeTags': '',
          'type': '',
          'type.emptyIcon': 'path',
          'type.smallIcon': 'path',
          'file': '',
          'publisher': ''
        },
        limit: 30,
        skipKeyCheck: true
      });

    }
  }
]);


export const DataRouter = maker.getRouter();
