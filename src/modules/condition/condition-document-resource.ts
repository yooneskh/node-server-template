import { IConditionDocument, IConditionDocumentBase } from './condition-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IConditionDocumentBase, IConditionDocument>('ConditionDocument');


maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'fields',
    type: 'series',
    title: 'فیلدها',
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
        key: 'type',
        type: 'string',
        enum: ['text', 'file', 'picture'],
        required: true,
        title: 'نوع',
        width: 6
      },
      {
        key: 'required',
        type: 'boolean',
        title: 'اجباری'
      }
    ]
  }
]);


export const ConditionDocumentModel      = maker.getModel();
export const ConditionDocumentController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.condition-document.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.condition-document.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.condition-document.retrieve'] },
  { template: 'CREATE', permissions: ['admin.condition-document.create'] },
  { template: 'UPDATE', permissions: ['admin.condition-document.update'] },
  { template: 'DELETE', permissions: ['admin.condition-document.delete'] }
]);


export const ConditionDocumentRouter = maker.getRouter();
