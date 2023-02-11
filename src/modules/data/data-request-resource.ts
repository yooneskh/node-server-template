import { IDataRequest, IDataRequestBase } from './data-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { InvalidRequestError } from '../../global/errors';
import { FactorController } from '../payment/factor-resource';
import { createPayTicket } from '../payment/pay-ticket-resource';
import { YEventManager } from '../../plugins/event-manager/event-manager';
import { IFactor } from '../payment/payment-interfaces';
import { createTransfer } from '../accounting/transfer-resource';
import { DataController } from './data-resource';
import { DataPermitController } from './data-permit-resource';
import { getAccountForUser, getDataRequestAccount, getGlobalSourceAccount } from '../accounting/account-resource';


const maker = new ResourceMaker<IDataRequestBase, IDataRequest>('DataRequest');


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
    key: 'data',
    type: 'string',
    ref: 'Data',
    required: true,
    title: 'داده',
    titleable: true
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
  },
  {
    key: 'step',
    type: 'number',
    hidden: true,
  },
  {
    key: 'permit',
    type: 'string',
    ref: 'DataPermit',
    title: 'مجوز دسترسی',
    hideInTable: true,
  },
]);


export const DataRequestModel      = maker.getModel();
export const DataRequestController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', /* permissions: ['admin.data-request.list']  */},
  { template: 'LIST_COUNT', /* permissions: ['admin.data-request.list-count']  */},
  { template: 'RETRIEVE', /* permissions: ['admin.data-request.retrieve']  */},
  { template: 'CREATE', /* permissions: ['admin.data-request.create']  */},
  { template: 'UPDATE', /* permissions: ['admin.data-request.update']  */},
  { template: 'DELETE', /* permissions: ['admin.data-request.delete']  */},
  { // pay for request
    method: 'POST',
    path: '/:resourceId/pay',
    signal: ['Route', 'DataRequest', 'Pay'],
    dataProvider: async ({ user, resourceId }) => {

      const dataRequest  = await DataRequestController.retrieve({ resourceId });
      const data = await DataController.retrieve({ resourceId: dataRequest.data });


      const selectedOffer = data.offers?.find(it => String(it._id) === dataRequest.selectedOffer);

      if (!selectedOffer || !( selectedOffer.price > 0 )) {
        throw new InvalidRequestError('selected offer does not have valid price');
      }


      const factor = await FactorController.create({
        payload: {
          user: String(user!._id),
          name: `پرداخت هزینه دسترسی برای ${user!.name} و داده ${data.title}`,
          amount: selectedOffer.price,
          meta: {
            reason: 'data-request',
            dataRequest: resourceId,
            amount: selectedOffer.price,
            userId: String(user!._id)
          }
        }
      });

      const payticket = await createPayTicket(String(factor._id), 'parsian');
      return payticket.payUrl;

    }
  },
  { // complete request
    method: 'POST',
    path: '/:resourceId/complete',
    signal: ['Route', 'DataRequest', 'Complete'],
    dataProvider: async ({ user, resourceId }) => {

      const dataRequest  = await DataRequestController.retrieve({ resourceId });


      const permit = await DataPermitController.create({
        payload: {
          user: user!._id,
          data: dataRequest.data,
        },
      });

      await DataRequestController.edit({
        resourceId,
        payload: {
          isCompleted: true,
          completedAt: Date.now(),
          permit: permit._id,
        }
      });

    }
  }
]);


export const DataRequestRouter = maker.getRouter();


YEventManager.on(['Resource', 'Factor', 'Payed'], async (_factorId: string, factor: IFactor) => {
  if (factor.meta?.reason !== 'data-request') return;

  const { dataRequest, amount, userId } = factor.meta;

  const globalSourceAccount = await getGlobalSourceAccount();
  const userAccount = await getAccountForUser(userId);
  const dataRequestAccount = await getDataRequestAccount();

  await createTransfer(globalSourceAccount._id, userAccount._id, amount, 'دسترسی به داده');
  await createTransfer(userAccount._id, dataRequestAccount._id, amount, 'دسترسی به داده');

  await DataRequestController.edit({
    resourceId: dataRequest,
    payload: {
      isCompleted: true,
      completedAt: Date.now(),
      isAccepted: true,
      acceptedAt: Date.now(),
    }
  });


  const dataRequestDoc = await DataRequestController.retrieve({
    resourceId: dataRequest
  });

  await DataPermitController.create({
    payload: {
      user: userId,
      data: dataRequestDoc.data,
    }
  });

});
