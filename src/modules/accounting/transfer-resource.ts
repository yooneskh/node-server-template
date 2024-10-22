import { ITransferBase, ITransfer } from './accounting-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { InvalidRequestError, InvalidStateError } from '../../global/errors';
import { AccountController, getAccountForUser, getGlobalSourceAccount, getGlobalDrainAccount } from './account-resource';
import { createTransaction } from './transaction-resource';


const maker = new ResourceMaker<ITransferBase, ITransfer>('Transfer');


maker.addProperties([
  {
    key: 'fromAccount',
    type: 'string',
    ref: 'Account',
    required: true,
    index: true,
    title: 'حساب مبدا',
    titleable: true
  },
  {
    key: 'fromTransaction',
    type: 'string',
    ref: 'Transaction',
    index: true,
    title: 'تراکنش مبدا',
    hideInTable: true
  },
  {
    key: 'toAccount',
    type: 'string',
    ref: 'Account',
    required: true,
    index: true,
    title: 'حساب مقصد',
    titleable: true
  },
  {
    key: 'toTransaction',
    type: 'string',
    ref: 'Transaction',
    index: true,
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


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.transfer.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.transfer.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.transfer.retrieve'] },
  {
    template: 'CREATE',
    permissions: ['admin.transfer.create'],
    dataProvider: async ({ payload }) => createTransfer(
      payload.fromAccount,
      payload.toAccount,
      payload.amount,
      payload.description
    )
  },
  { template: 'UPDATE', permissions: ['admin.transfer.update'] },
  { template: 'DELETE', permissions: ['admin.transfer.delete'] },
  {
    method: 'GET',
    path: '/list/mine',
    signal: ['Router', 'Transfer', 'ListMine'],
    permissions: ['user.transfer.list-mine'],
    dataProvider: async ({ user }) => {

      const account = await getAccountForUser(user!._id);

      const transfers = await TransferController.list({
        filters: {
          $or: [
            {
              fromAccount: account._id,
            },
            {
              toAccount: account._id,
            },
          ]
        },
        sorts: {
          _id: -1,
        },
        skipKeyCheck: true,
      });

      return transfers.map(it => {

        let amount = it.amount;

        if (String(it.fromAccount) === String(account._id)) {
          amount = -it.amount;
        }


        return {
          _id: it._id,
          amount,
          description: it.description,
          createdAt: it.createdAt,
        };

      });

    },
  },
]);


export const TransferRouter = maker.getRouter();


export async function createTransfer(fromAccountId: string, toAccountId: string, amount: number, description?: string): Promise<ITransfer> {
  if (!( amount > 0 )) throw new InvalidRequestError('invalid transfer amount', 'میزان انتقال صحیح نیست.');

  const [fromAccount, toAccount] = await Promise.all([
    AccountController.retrieve({ resourceId: fromAccountId }),
    AccountController.retrieve({ resourceId: toAccountId })
  ]);

  if (!fromAccount.acceptsOutput) throw new InvalidStateError('source account does not accept output', 'حساب مبدا خروجی ندارد.');
  if (!toAccount.acceptsInput) throw new InvalidStateError('destination account does not accept input', 'حساب مقصد ورودی ندارد.');

  // TODO: make code below happen in transaction
  if (fromAccount.balance < amount && !fromAccount.allowNegativeBalance) {
    throw new InvalidStateError('source account does not have sufficient balance', 'حساب موجودی ندارد.');
  }

  const transfer = await TransferController.create({
    payload: {
      fromAccount: fromAccountId,
      toAccount: toAccountId,
      amount,
      description
    }
  });

  const fromTransaction = await createTransaction(fromAccountId, -amount, description ? `برداشت جهت ${description}` : undefined);
  const toTransaction = await createTransaction(toAccountId, amount, description ? `واریز جهت ${description}` : undefined);

  return TransferController.edit({
    resourceId: transfer._id,
    payload: {
      fromTransaction: fromTransaction._id,
      toTransaction: toTransaction._id
    }
  });

}

export async function depositIntoUserAccount(userId: string, amount: number, description?: string) {
  const account = await getAccountForUser(userId);
  return depositIntoAccount(account._id, amount, description);
}

export async function depositIntoAccount(accountId: string, amount: number, description?: string) {
  if (!accountId || !amount || amount < 0) throw new InvalidRequestError('invalid account or amount');

  const sourceAccount = await getGlobalSourceAccount();
  return createTransfer(sourceAccount._id, accountId, amount, description || 'واریز به حساب');

}

export async function withdrawFromUserAccount(userId: string, amount: number, description?: string) {
  const account = await getAccountForUser(userId);
  return withdrawFromAccount(account._id, amount, description);
}

export async function withdrawFromAccount(accountId: string, amount: number, description?: string) {
  if (!accountId || !amount || amount < 0) throw new InvalidRequestError('invalid account or amount');

  const drainAccount = await getGlobalDrainAccount();
  return createTransfer(accountId, drainAccount._id, amount, description || 'برداشت از حساب');

}
