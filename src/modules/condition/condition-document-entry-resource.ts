import { IConditionDocumentEntry, IConditionDocumentEntryBase } from './condition-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IConditionDocumentEntryBase, IConditionDocumentEntry>('ConditionDocumentEntry');


maker.addProperties([
  {
    key: 'conditionDocument',
    type: 'string',
    ref: 'ConditionDocument',
    required: true,
    title: 'سند',
    titleable: true
  },
  {
    key: 'user',
    type: 'string',
    ref: 'User',
    required: true,
    title: 'کاربر',
    titleable: true
  },
  {
    key: 'informations',
    type: 'series',
    title: 'اطلاعات',
    serieBase: {},
    serieSchema: [
      {
        key: 'title',
        type: 'string',
        required: true,
        title: 'عنوان',
        width: 6
      },
      {
        key: 'value',
        type: 'string',
        required: true,
        title: 'مقدار',
        width: 6
      }
    ]
  },
  {
    key: 'files',
    type: 'series',
    title: 'فایل‌ها',
    serieBase: {},
    serieSchema: [
      {
        key: 'title',
        type: 'string',
        required: true,
        title: 'عنوان',
        width: 6
      },
      {
        key: 'value',
        type: 'string',
        ref: 'Media',
        required: true,
        title: 'مقدار',
        width: 6
      }
    ]
  },
  {
    key: 'isAccepted',
    type: 'boolean',
    title: 'تایید شده'
  },
  {
    key: 'accpetedAt',
    type: 'number',
    title: 'زمان تایید',
    labelFormat: 'jYYYY/jMM/jDD HH:mm:ss'
  },
  {
    key: 'isRejected',
    type: 'boolean',
    title: 'رد شده'
  },
  {
    key: 'rejectedAt',
    type: 'number',
    title: 'زمان رد',
    labelFormat: 'jYYYY/jMM/jDD HH:mm:ss'
  },
  {
    key: 'rejectedFor',
    type: 'string',
    title: 'دلیل رد'
  }
]);


export const ConditionDocumentEntryModel      = maker.getModel();
export const ConditionDocumentEntryController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST',/*  permissions: ['admin.condition-document-entry.list']  */},
  { template: 'LIST_COUNT',/*  permissions: ['admin.condition-document-entry.list-count']  */},
  { template: 'RETRIEVE',/*  permissions: ['admin.condition-document-entry.retrieve']  */},
  { template: 'CREATE',/*  permissions: ['admin.condition-document-entry.create']  */},
  { template: 'UPDATE', permissions: ['admin.condition-document-entry.update'] },
  { template: 'DELETE', permissions: ['admin.condition-document-entry.delete'] }
]);


export const ConditionDocumentEntryRouter = maker.getRouter();
