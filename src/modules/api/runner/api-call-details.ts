import { InvalidRequestError } from '../../../global/errors';
import { ResourceMaker } from '../../../plugins/resource-maker/resource-maker';
import { ApiLogController } from '../api-log-resource';
import { ApiPermitController } from '../api-permit-resource';


const maker = new ResourceMaker('ApiCallDetails');


maker.addAction({
  method: 'POST',
  path: '/api/api-details',
  signal: ['Route', 'ApiCallDetails', 'Execute'],
  rateLimitOptions: {
    pointsAmount: 3,
    pointsInterval: 60 * 1,
    blockDuration: 60 * 2,
    consecutiveFailDurationMultiplier: 1.5,
  },
  dataProvider: async ({ payload }) => {

    const { user, permit } = payload;


    const query: any = {};

    if (permit) {
      query['permit'] = permit;
    }
    else if (user) {

      const userPermits = await ApiPermitController.list({
        filters: {
          user,
        }
      });

      query['permit'] = { $in: userPermits.map(it => String(it._id)) };

    }
    else {
      throw new InvalidRequestError('مجوز یا کاربر باید ارسال شود.');
    }


    const logs = await ApiLogController.list({
      filters: query,
      skipKeyCheck: true,
    });


    return [
      {
        type: 'banner-icon',
        icon: 'mdi-earth',
        title: 'تعداد فراخوانی‌های Api',
        value: logs.length,
        width: 4,
      },
      {
        type: 'banner-icon',
        icon: 'mdi-check-circle',
        title: 'تعداد فراخوانی‌های موفق Api',
        value: logs.filter(it => it.success).length,
        width: 4,
      },
      {
        type: 'banner-icon',
        icon: 'mdi-close-circle',
        title: 'تعداد فراخوانی‌های ناموفق Api',
        value: logs.filter(it => !it.success).length,
        width: 4,
      },
    ];

}
});


export const ApiCallDetailsRouter = maker.getRouter();
