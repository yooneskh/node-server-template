import { ITransactionBase, ITransaction } from './accounting-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { InvalidRequestError } from '../../global/errors';
import { AccountController } from './account-resource';


const maker = new ResourceMaker<ITransactionBase>('Transaction');

maker.addProperties([
  {
    key: 'account',
    type: 'string',
    ref: 'Account',
    required: true,
    title: 'حساب',
    titleable: true
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
  },
]);

export const TransactionModel      = maker.getModel();
export const TransactionController = maker.getController();


maker.addActions([
  { template: 'LIST', permissions: ['admin.transaction.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.transaction.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.transaction.retrieve'] },
  {
    template: 'CREATE',
    permissions: ['admin.transaction.create'],
    dataProvider: async ({ payload }) => createTransaction(
      payload.account,
      payload.amount,
      payload.description
    )
  },
  {
    template: 'UPDATE',
    permissions: ['admin.transaction.update'],
  },
  {
    template: 'DELETE',
    permissions: ['admin.transaction.delete'],
  }
]);

export const TransactionRouter = maker.getRouter();


export async function createTransaction(accountId: string, amount: number, description?: string): Promise<ITransaction> {
  if (!amount || amount === 0) throw new InvalidRequestError('invalid amount');

  const account = await AccountController.retrieve({ resourceId: accountId });

  if (amount > 0 && !account.acceptsInput) {
    throw new InvalidRequestError('account does not accept input');
  }
  else if (amount < 0 && !account.acceptsOutput) {
    throw new InvalidRequestError('account does not accept output');
  }

  const transaction = await TransactionController.create({
    payload: {
      account: account._id,
      amount,
      description
    }
  });

  await AccountController.editQuery({
    resourceId: accountId,
    query: {
      $inc: {
        balance: amount
      }
    }
  });

  return transaction;

}
