import { YEventManager } from '../../plugins/event-manager/event-manager';
import { sendLookupSMS } from '../../plugins/kavenegar-sender/kavenegar-sender';
import { Config } from '../../global/config';
import { IAuthToken } from '../auth/auth-interfaces';

YEventManager.on(['Resource', 'AuthToken', 'Created'], async (_authTokenId: string, authToken: IAuthToken) => {
  if (!Config.authentication.staticVerificationCode && authToken.propertyType === 'phoneNumber') {
    sendLookupSMS({
      receptor: authToken.propertyValue!,
      template: '---',
      token: authToken.verificationCode!
    });
  }
});
