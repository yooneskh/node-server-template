import { YEventManager } from '../../plugins/event-manager/event-manager';
import { IAuthToken } from '../modules-interfaces';
import { sendLookupSMS } from '../../plugins/kavenegar-sender/kavenegar-sender';
import { Config } from '../../global/config';

YEventManager.on(['Resource', 'AuthToken', 'Created'], async (authTokenId: string, authToken: IAuthToken) => {
  if (!Config.authentication.staticVerificationCode && authToken.propertyType === 'phoneNumber') {
    sendLookupSMS({
      receptor: authToken.propertyValue!,
      template: 'MarkazeTebVerify',
      token: authToken.verificationCode!
    });
  }
});
