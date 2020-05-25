import { ITransferBase, ITransfer, IFactor } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-router-enums';
import { InvalidRequestError, InvalidStateError } from '../../global/errors';
import { AccountController, getAccountForUser, getGlobalSource, getGlobalDrain } from './account-resource';
import { createTransaction } from './transaction-resource';
import { YEventManager } from '../../plugins/event-manager/event-manager';


const maker = new ResourceMaker<ITransferBase>('Transfer');

maker.addProperties([
  {
    key: 'fromAccount',
    type: 'string',
    ref: 'Account',
    required: true,
    title: 'حساب مبدا',
    titleable: true
  },
  {
    key: 'fromTransaction',
    type: 'string',
    ref: 'Transaction',
    title: 'تراکنش مبدا',
    hideInTable: true
  },
  {
    key: 'toAccount',
    type: 'string',
    ref: 'Account',
    required: true,
    title: 'حساب مقصد',
    titleable: true
  },
  {
    key: 'toTransaction',
    type: 'string',
    ref: 'Transaction',
    title: 'تراکنش مقصد',
    hideInTable: true
  },
  {
    key: 'amount',
    type: 'number',
    required: true,
    title: 'میزان',
    titleable: true
  },
  {
    key: 'description',
    type: 'string',
    title: 'توضیحات'
  }
]);

export const TransferModel      = maker.getModel();
export const TransferController = maker.getController();


maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  {
    template: ResourceActionTemplate.CREATE,
    dataProvider: async ({ request }) => createTransfer(
      request.body.fromAccount,
      request.body.toAccount,
      request.body.amount,
      request.body.description
    )
  },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const TransferRouter = maker.getRouter();


// charge account factor payment
YEventManager.on(['Resource', 'Factor', 'Payed'], async (factorId: string, factor: IFactor) => {
  if (factor.meta && factor.meta.bankChargeAccountId) {
    await depositIntoAccount(factor.meta.bankChargeAccountId, factor.meta.chargeAmount);
  }
});

export async function createTransfer(fromAccountId: string, toAccountId: string, amount: number, description?: string): Promise<ITransfer> {
  if (!amount || amount <= 0) throw new InvalidRequestError('invalid transfer amount');

  const [fromAccount, toAccount] = await Promise.all([
    AccountController.retrieve({ resourceId: fromAccountId }),
    AccountController.retrieve({ resourceId: toAccountId })
  ]);

  if (!fromAccount.acceptsOutput) throw new InvalidStateError('source account does not accept output');
  if (!toAccount.acceptsInput) throw new InvalidStateError('destination account does not accept input');

  // TODO: make code below happen in transaction
  if (fromAccount.balance < amount && !fromAccount.meta.globalSource) {
    throw new InvalidStateError('source account does not have sufficient balance');
  }

  const transfer = await TransferController.create({
    payload: {
      fromAccount: fromAccountId,
      toAccount: toAccountId,
      amount,
      description
    }
  });

  const fromTransaction = await createTransaction(fromAccountId, -amount, description);
  transfer.fromTransaction = fromTransaction._id;
  await transfer.save();

  const toTransaction = await createTransaction(toAccountId, amount, description);
  transfer.toTransaction = toTransaction._id;
  await transfer.save();

  return transfer;

}

export async function depositIntoUserAccount(userId: string, amount: number, description?: string) {
  const account = await getAccountForUser(userId);
  return depositIntoAccount(account._id, amount, description);
}

export async function depositIntoAccount(accountId: string, amount: number, description?: string) {
  if (!accountId || !amount || amount < 0) throw new InvalidRequestError('invalid account or amount');

  const sourceAccount = await getGlobalSource();
  return createTransfer(sourceAccount._id, accountId, amount, description || 'واریز به حساب');

}

export async function withdrawFromUserAccount(userId: string, amount: number, description?: string) {
  const account = await getAccountForUser(userId);
  return withdrawFromAccount(account._id, amount, description);
}

export async function withdrawFromAccount(accountId: string, amount: number, description?: string) {
  if (!accountId || !amount || amount < 0) throw new InvalidRequestError('invalid account or amount');

  const drainAccount = await getGlobalDrain();
  return createTransfer(accountId, drainAccount._id, amount, description || 'برداشت از حساب');

}
