import { YEventManager } from '../../plugins/event-manager/event-manager';
import { IFactor } from '../payment/payment-interfaces';
import { getGlobalSourceAccount } from './account-resource';
import { createTransfer } from './transfer-resource';


YEventManager.on(['Resource', 'Factor', 'Payed'], async (_factorId: string, factor: IFactor) => {
  if (factor.meta?.reason !== 'account-charge') return;

  const { account, amount } = factor.meta;
  const globalSourceAccount = await getGlobalSourceAccount();

  await createTransfer(globalSourceAccount._id, account, amount, 'شارژ حساب');

});
