import { ResourceMaker } from '../../../plugins/resource-maker/resource-maker';
import { ApiLogController } from '../api-log-resource';


const maker = new ResourceMaker('ApiCallDetails');


maker.addAction({
  method: 'POST',
  path: '/api/api-details',
  signal: ['Route', 'ApiCallDetails', 'Execute'],
  rateLimitOptions: undefined,
  dataProvider: async ({payload}) => {

   const successfullCallCount = await ApiLogController.count({
    filters: {
      success: true,
      $and: [
        {
          createdAt: { $gte: payload.startAt }
        },
        {
          createdAt: { $lte: payload.endAt }
        }
      ]
    },
    skipKeyCheck: true
  });

  return [
    {
      'icon': 'mdi-check-circle',
      'title': 'تعداد فراخوانی‌های موفق Api',
      'value': successfullCallCount,
      'width': 4
    }
  ];

}
});


export const ApiCallDetailsRouter = maker.getRouter();
