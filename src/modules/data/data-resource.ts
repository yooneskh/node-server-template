import { IData, IDataBase } from './data-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { PublisherController } from './publisher-resource';
import { DataCategoryController, getSuccessorIds } from './data-category-resource';
import { TimeTagController } from './time-tag-resource';
import { DataTypeController } from './data-type-resource';


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
    // required: true,
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
    title: 'فایل',
    width: 6,
    hidden: true,
  },
  {
    key: 'visualization',
    type: 'string',
    title: 'شناسه گزارش',
    width: 6,
    hidden: true,
  },
  {
    key: 'versions',
    type: 'series',
    title: 'نسخه‌ها',
    serieBase: {},
    serieSchema: [
      {
        key: 'versionName',
        type: 'string',
        required: true,
        title: 'شماره نسخه',
        width: 4,
      },
      {
        key: 'file',
        type: 'string',
        ref: 'Media',
        title: 'فایل',
        width: 4,
      },
      {
        key: 'visualization',
        type: 'string',
        title: 'شناسه گزارش',
        width: 4,
      },
    ],
  },
  {
    key: 'publisher',
    type: 'string',
    ref: 'Publisher',
    title: 'انتشار دهنده'
  },
  {
    key: 'region',
    type: 'number',
    title: 'منطقه شهرداری'
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

      const validTimeTags = await TimeTagController.list({
        filters: {
          title: { $regex: new RegExp(query, 'i') }
        },
      });

      const validDataTypes = await DataTypeController.list({
        filters: {
          title: { $regex: new RegExp(query, 'i') }
        },
      });

      const validPublishers = await PublisherController.list({
        filters: {
          title: { $regex: new RegExp(query, 'i') }
        },
      });


      return DataController.list({
        filters: {
          $or: [
            {
              title: { $regex: new RegExp(query, 'i') },
            },
            {
              description: { $regex: new RegExp(query, 'i') },
            },
            {
              region: Number(query) || 0,
            },
            {
              tags: { $regex: new RegExp(query, 'i') } as any,
            },
            {
              timeTags: { $in: validTimeTags.map(it => it._id) },
            },
            {
              type: { $in: validDataTypes.map(it => it._id) },
            },
            {
              publisher: { $in: validPublishers.map(it => it._id) },
            },
          ],
        },
        includes: {
          'timeTags': '',
          'type': '',
          'type.emptyIcon': 'path',
          'type.smallIcon': 'path',
          'file': '',
          'publisher': '',
        },
        skipKeyCheck: true,
      });

    }
  },
  {
    method: 'GET',
    path: '/custom/search/meta',
    signal: ['Route', 'Data', 'SearchMeta'],
    dataProvider: async () => {

      const [categories, publishers] = await Promise.all([
        DataCategoryController.list({}),
        PublisherController.list({}),
      ]);

      return {
        categories,
        publishers,
      };

    }
  },
  { // search
    method: 'GET',
    path: '/custom/search',
    signal: ['Route', 'Data', 'SearchCustom'],
    dataProvider: async ({ query }) => {

      const { category, title, description, region, timeFrom, timeTo, publisher, tags } = query;

      // tslint:disable-next-line: no-any
      const filters: any = {};

      if (title) {
        filters['title'] = { $regex: new RegExp(title, 'i') };
      }

      if (description) {
        filters['description'] = { $regex: new RegExp(description, 'i') };
      }

      if (region && Number(region)) {
        filters['region'] = Number(region);
      }

      if (publisher) {
        filters['publisher'] = publisher;
      }

      if (category) {

        const categoryIds = await getSuccessorIds(category);

        filters['category'] = { $in: categoryIds };

      }

      if (timeFrom || timeTo) {

        const allTimeTags = await TimeTagController.list({
          lean: true
        });

        const targetTimeTags = allTimeTags.filter(timeTag => {

          const [tagStart, _tagEnd] = (
            timeTag.title.split('-')
              .map(Number)
              .map(it => it > 1300 ? it : 1300 + it)
          );

          const tagEnd = _tagEnd || tagStart;


          const [filterStart, filterEnd] = (
            [timeFrom, timeTo]
              .map(Number)
              .map(it => it > 1300 ? it : 1300 + it)
          );


          if (filterStart & filterEnd) {
            return (filterStart <= tagStart && filterEnd >= tagEnd) || (filterStart >= tagStart && filterStart <= tagEnd) || (filterEnd >= tagStart && filterEnd <= tagEnd);
          }
          else if (filterStart) {
            return filterStart <= tagStart || filterStart <= tagEnd;
          }
          else {
            return tagStart <= filterEnd || tagEnd <= filterEnd;
          }

        });


        filters['timeTags'] = { $in: targetTimeTags.map(it => it._id) };

      }

      if (tags) {
        filters['tags'] = { $regex: new RegExp(tags, 'i') };
      }

      return DataController.list({
        filters,
        includes: {
          'timeTags': '',
          'type': '',
          'type.emptyIcon': 'path',
          'type.smallIcon': 'path',
          'versions': '',
          'versions.file': '',
          'publisher': ''
        },
        limit: 30,
        skipKeyCheck: true
      });

    }
  }
]);


export const DataRouter = maker.getRouter();
