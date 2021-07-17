import { IApiRateLimitConfig, IApiRateLimitConfigBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiRateLimitConfigBase, IApiRateLimitConfig>('ApiRateLimitConfig');


maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'duration',
    type: 'string',
    enum: ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
    required: true,
    title: 'دوره',
    items: [
      { value: 'second', text: 'ثانیه' },
      { value: 'minute', text: 'دقیقه' },
      { value: 'hour', text: 'ساعت' },
      { value: 'day', text: 'روز' },
      { value: 'week', text: 'هفته' },
      { value: 'month', text: 'ماه' },
      { value: 'year', text: 'سال' }
    ]
  },
  {
    key: 'durationMultiplier',
    type: 'number',
    required: true,
    title: 'تعداد دوره'
  },
  {
    key: 'points',
    type: 'number',
    required: true,
    title: 'تعداد'
  }
]);


export const ApiRateLimitConfigModel      = maker.getModel();
export const ApiRateLimitConfigController = maker.getController();


maker.setValidations({
  'durationMultiplier': [
    async (it, e) => it.durationMultiplier > 0 || e('تعداد دوره باید بیشتر از 0 باشد.')
  ]
});


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-rate-limit-config.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-rate-limit-config.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-rate-limit-config.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-rate-limit-config.create'] },
  { template: 'UPDATE', permissions: ['admin.api-rate-limit-config.update'] },
  { template: 'DELETE', permissions: ['admin.api-rate-limit-config.delete'] }
]);


export const ApiRateLimitConfigRouter = maker.getRouter();
