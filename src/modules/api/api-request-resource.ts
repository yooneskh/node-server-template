import { IApiRequest, IApiRequestBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ApiPolicyController } from './api-policy-resource';
import { ApiEndpointController } from './api-endpoint-resource';
import { InvalidRequestError } from '../../global/errors';
import { FactorController } from '../payment/factor-resource';
import { createPayTicket } from '../payment/pay-ticket-resource';
import { YEventManager } from '../../plugins/event-manager/event-manager';
import { IFactor } from '../payment/payment-interfaces';
import { getAccountForUser, getApiRequestAccount, getGlobalSourceAccount } from '../accounting/account-resource';
import { createTransfer } from '../accounting/transfer-resource';
import { ApiPermitController } from './api-permit-resource';


function makeUUID(sections: number) {
  return new Array(sections).fill(undefined).map(() =>
    Math.random().toString(16).slice(2)
  ).join('-');
}


const maker = new ResourceMaker<IApiRequestBase, IApiRequest>('ApiRequest');


maker.addProperties([
  {
    key: 'user',
    type: 'string',
    ref: 'User',
    required: true,
    title: 'کاربر',
    titleable: true
  },
  {
    key: 'apiEndpoint',
    type: 'string',
    ref: 'ApiEndpoint',
    required: true,
    title: 'وب سرویس',
    titleable: true
  },
  {
    key: 'formProductTitle',
    type: 'string',
    title: 'عنوان محصول'
  },
  {
    key: 'formProductType',
    type: 'string',
    title: 'نوع محصول',
    hideInTable: true,
    width: 6
  },
  {
    key: 'formIp',
    type: 'string',
    title: 'آی‌پی سرور استفاده کننده',
    hideInTable: true,
    width: 6
  },
  {
    key: 'formCallType',
    type: 'string',
    enum: ['automatic-transfer', 'repetitive-tranfer', 'daily-transfer' , 'weekly-transfer' , 'monthly-transfer' , 'specific-period-transfer'],
    items: [
      { value: 'automatic-transfer', text: 'انتقال اتوماتیک' },
      { value: 'repetitive-tranfer', text: 'انتقال تکرار شونده' },
      { value: 'daily-transfer', text: ' انتقال اطلاعات به صورت روزانه' },
      { value: 'weekly-transfer', text: ' انتقال اطلاعات به صورت هفتگی' },
      { value: 'monthly-transfer', text: ' انتقال اطلاعات به صورت ماهانه' },
      { value: 'specific-period-transfer', text: 'انتقال اطلاعات از تاریخ تا تاریخ ' }
    ],
    title: 'نوع فراخوانی',
    hideInTable: true
  },
  {
    vIf: { formCallType: 'specific-period-transfer' },
    key: 'formCallTypeFromDate',
    type: 'number',
    title: 'از تاریخ',
    labelFormat: 'jYYYY/jMM/jDD',
    hideInTable: true,
    width: 6
  },
  {
    vIf: { formCallType: 'specific-period-transfer' },
    key: 'formCallTypeUntilDate',
    type: 'number',
    title: 'تا تاریخ',
    labelFormat: 'jYYYY/jMM/jDD',
    hideInTable: true,
    width: 6
  },
  {
    key: 'formDescription',
    type: 'string',
    title: 'توضیحات',
    hideInTable: true,
    longText: true
  },
  {
    key: 'selectedOffer',
    type: 'string',
    hidden: true
  },
  {
    key: 'isCompleted',
    type: 'boolean',
    title: 'تکمیل شده',
    width: 6
  },
  {
    vIf: { isCompleted: true },
    key: 'completedAt',
    type: 'number',
    title: 'زمان تکمیل',
    labelFormat: 'jYYYY/jMM/jDD',
    width: 6
  },
  {
    key: 'isAccepted',
    type: 'boolean',
    title: 'تایید شده',
    width: 6
  },
  {
    vIf: { isAccepted: true },
    key: 'acceptedAt',
    type: 'number',
    title: 'زمان تایید',
    labelFormat: 'jYYYY/jMM/jDD',
    width: 6
  },
  {
    key: 'isRejected',
    type: 'boolean',
    title: 'رد شده',
    width: 6
  },
  {
    vIf: { isRejected: true },
    key: 'rejectedAt',
    type: 'number',
    title: 'زمان رد',
    labelFormat: 'jYYYY/jMM/jDD',
    width: 6
  },
  {
    vIf: { isRejected: true },
    key: 'rejectedFor',
    type: 'string',
    title: 'دلیل رد'
  },
  {
    key: 'isCanceled',
    type: 'boolean',
    title: 'لغو شده',
    width: 6
  },
  {
    vIf: { isCanceled: true },
    key: 'canceledAt',
    type: 'number',
    title: 'زمان لغو',
    labelFormat: 'jYYYY/jMM/jDD',
    width: 6
  },
  {
    vIf: { isCanceled: true },
    key: 'canceledFor',
    type: 'string',
    title: 'دلیل لغو'
  }
]);


export const ApiRequestModel      = maker.getModel();
export const ApiRequestController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', /* permissions: ['admin.api-request.list']  */},
  { template: 'LIST_COUNT', /* permissions: ['admin.api-request.list-count']  */},
  { template: 'RETRIEVE', /* permissions: ['admin.api-request.retrieve']  */},
  { template: 'CREATE', /* permissions: ['admin.api-request.create']  */},
  { template: 'UPDATE', /* permissions: ['admin.api-request.update']  */},
  { template: 'DELETE', /* permissions: ['admin.api-request.delete']  */},
  { // pay for request
    method: 'POST',
    path: '/:resourceId/pay',
    signal: ['Route', 'ApiRequest', 'Pay'],
    dataProvider: async ({ user, resourceId }) => {

      const apiRequest  = await ApiRequestController.retrieve({ resourceId });
      const apiEndpoint = await ApiEndpointController.retrieve({ resourceId: apiRequest.apiEndpoint });

      const policy = await ApiPolicyController.retrieve({
        resourceId: apiEndpoint.offers!.find(it => String(it._id) === apiRequest.selectedOffer)!.policy
      });

      if (!policy.paymentStaticCost || !( policy.paymentStaticCost > 0 )) {
        throw new InvalidRequestError('this policy does not have static cost');
      }

      const factor = await FactorController.create({
        payload: {
          user: String(user!._id),
          name: `پرداخت هزینه دسترسی برای ${user!.name}`,
          amount: policy.paymentStaticCost!,
          meta: {
            reason: 'api-request',
            apiRequest: resourceId,
            amount: policy.paymentStaticCost!,
            userId: String(user!._id)
          }
        }
      });

      const payticket = await createPayTicket(String(factor._id), 'parsian');
      return payticket.payUrl;

    }
  },
  { // make test version
    method: 'POST',
    path: '/:resourceId/transform/test',
    signal: ['Route', 'ApiRequest', 'TransformTest'],
    dataProvider: async ({ user, resourceId }) => {

      const apiRequest  = await ApiRequestController.retrieve({ resourceId });
      const apiEndpoint = await ApiEndpointController.retrieve({ resourceId: apiRequest.apiEndpoint });
      if (!apiEndpoint.testVersionPolicy) {
        throw new InvalidRequestError('this api does not have test version.', 'این Api نسخه تستی ندارد');
      }


      await ApiRequestController.edit({
        resourceId,
        payload: {
          isCompleted: true,
          completedAt: Date.now()
        }
      });


      await ApiPermitController.create({
        payload: {
          user: user!._id,
          apiEndpoint: apiRequest.apiEndpoint,
          enabled: true,
          apiKey: makeUUID(3),
          identifier: makeUUID(3),
          policy: apiEndpoint.testVersionPolicy
        }
      });

    }
  }
]);


export const ApiRequestRouter = maker.getRouter();


YEventManager.on(['Resource', 'Factor', 'Payed'], async (_factorId: string, factor: IFactor) => {
  if (factor.meta?.reason !== 'api-request') return;

  const { apiRequest, amount, userId } = factor.meta;

  const globalSourceAccount = await getGlobalSourceAccount();
  const userAccount = await getAccountForUser(userId);
  const apiRequestAccount = await getApiRequestAccount();

  await createTransfer(globalSourceAccount._id, userAccount._id, amount, 'دسترسی به Api');
  await createTransfer(userAccount._id, apiRequestAccount._id, amount, 'دسترسی به Api');

  await ApiRequestController.edit({
    resourceId: apiRequest,
    payload: {
      isCompleted: true,
      completedAt: Date.now()
    }
  });


  const apiRequestDoc = await ApiRequestController.retrieve({
    resourceId: apiRequest
  });

  const apiEndpoint = await ApiEndpointController.retrieve({
    resourceId: apiRequestDoc.apiEndpoint
  });

  await ApiPermitController.create({
    payload: {
      user: userId,
      apiEndpoint: apiRequestDoc.apiEndpoint,
      enabled: true,
      apiKey: makeUUID(3),
      identifier: makeUUID(3),
      policy: apiEndpoint.offers!.find(it =>
        String(it._id) === apiRequestDoc.selectedOffer
      )!.policy
    }
  });

});
