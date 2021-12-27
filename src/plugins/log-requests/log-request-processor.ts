import { getUserByToken } from '../../modules/auth/auth-resource';
import { ResourceRouter } from '../resource-maker/resource-router';
import { ILogService } from './log-interfaces';
import { LogController } from './log-resource';


ResourceRouter.addPreProcessor(async context => {
  let log: ILogService;
  if(context.action.signal?.[2]! === 'Update' || context.action.signal?.[2]! === 'Delete' || context.action.signal?.[2]! === 'Create'){
      log = await LogController.create({
      payload: {
        user: (await getUserByToken(context.request.headers.authorization))?._id,
        document: context.action.signal?.[1]!,
        data: context.payload,
        action: context.action.signal?.[2]!
      }
    });
    console.log(log);
  }
});