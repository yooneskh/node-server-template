import '../global/database';

import { disconnect } from 'mongoose';
import { UserController } from '../modules/user/user-resource';

const NAME = 'یونس خوش قدم';
const PHONENUMBER = '+989364524952';
const PERMISSIONS = ['user.*', 'admin.*'];

(async () => {

  const user = await UserController.create({
    payload: {
      name: NAME,
      phoneNumber: PHONENUMBER,
      permissions: PERMISSIONS
    }
  });

  console.log('the user', user);

  disconnect();

})();
