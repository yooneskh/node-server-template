import '../global/database';

import { disconnect } from 'mongoose';
import { AuthController } from '../modules/auth/auth-resource';

(async () => {

  const tokens = await AuthController.list({
    filters: { valid: false }
  });

  console.log('count: ', tokens.length);

  await Promise.all(
    tokens.map(token =>
      AuthController.delete({ resourceId: token._id })
    )
  )

  console.log('all deleted');

  disconnect();

})();
