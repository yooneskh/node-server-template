import { getUserByToken } from '../../modules/auth/auth-resource';
import { ResourceRouter } from '../resource-maker/resource-router';
import { LogController } from './log-resource';
import { YNetwork } from 'ynetwork';


ResourceRouter.addPreProcessor(async context => {

  if (!context.action.signal?.[2] || !['create', 'update', 'delete'].includes(context.action.signal?.[2]?.toLowerCase())) return;

  // tslint:disable-next-line: no-any
  let requestData: any;

  const isSignalTypeDelete = context.action.signal?.[2]!.toLowerCase() === 'delete';

  if (isSignalTypeDelete) {
    const { data } = await YNetwork.get(context.request.url , { 'Content-Type': 'application/json', 'Authorization': context.request.headers.authorization });
    requestData = data;
  }

  await LogController.create({
    payload: {
      user: (await getUserByToken(context.request.headers.authorization))?._id,
      document: context.action.signal?.[1]!,
      data: isSignalTypeDelete ? requestData : context.payload,
      action: context.action.signal?.[2]!
    }
  });

});
