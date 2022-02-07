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
        {createdAt: { $gte: payload.startAt }} ,
        {createdAt: { $lte: payload.endAt }}
       ]
    }
  });

  return [{
      "icon": "mdi-check",
      "width" : "4",
      "value": successfullCallCount,
      "description" : "تعداد بازخوانی‌های موفق api"
  }]
}
});


export const ApiCallDetailsRouter = maker.getRouter();
