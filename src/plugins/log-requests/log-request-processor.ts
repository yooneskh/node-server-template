import { getUserByToken } from '../../modules/auth/auth-resource';
import { ResourceRouter } from '../resource-maker/resource-router';
import { LogController } from './log-resource';


ResourceRouter.addPreProcessor(async context => {

  if (!context.action.signal?.[2] || !['create', 'update', 'delete'].includes(context.action.signal?.[2]?.toLowerCase())) return;

  await LogController.create({
    payload: {
      user: (await getUserByToken(context.request.headers.authorization))?._id,
      document: context.action.signal?.[1]!,
      data: context.payload,
      action: context.action.signal?.[2]!
    }
  });

});
