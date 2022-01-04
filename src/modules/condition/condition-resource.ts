import { ICondition, IConditionBase } from './condition-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IConditionBase, ICondition>('Condition');


maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'type',
    type: 'string',
    enum: ['user-property', 'document-submission'],
    required: true,
    title: 'نوع',
    items: [
      { value: 'user-property', text: 'ویژگی کاربر' },
      { value: 'document-submission', text: 'تکمیل فرم' }
    ]
  },
  {
    vIf: { type: 'user-property' },
    key: 'property',
    type: 'string',
    enum: ['type', 'age'],
    title: 'ویژگی',
    items: [
      { value: 'type', text: 'نوع' },
      { value: 'age', text: 'سن' }
    ]
  },
  {
    vIf: { type: 'user-property' },
    key: 'propertyValue',
    type: 'string',
    title: 'مقدار ویژگی'
  },
  {
    vIf: { type: 'document-submission' },
    key: 'document',
    type: 'string',
    ref: 'ConditionDocument',
    title: 'فرم شرط'
  }
]);


export const ConditionModel      = maker.getModel();
export const ConditionController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-receiver.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-receiver.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-receiver.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-receiver.create'] },
  { template: 'UPDATE', permissions: ['admin.api-receiver.update'] },
  { template: 'DELETE', permissions: ['admin.api-receiver.delete'] }
]);


export const ConditionRouter = maker.getRouter();
