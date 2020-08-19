import '../global/database';

import { disconnect } from 'mongoose';
import { AuthTokenController } from '../modules/auth/auth-token-resource';

(async () => {

  const tokens = await AuthTokenController.list({
    filters: {
      type: 'OTP',
      valid: false
    }
  });

  console.log('count: ', tokens.length);

  await Promise.all(
    tokens.map(token =>
      AuthTokenController.delete({ resourceId: token._id })
    )
  )

  console.log('all deleted');

  disconnect();

})();
