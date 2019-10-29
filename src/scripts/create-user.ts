import '../global/database';

import { disconnect } from 'mongoose';
import { UserController } from '../modules/user/user-resource';

const FIRSTNAME = 'یونس';
const LASTNAME = 'خوش قدم';
const PHONENUMBER = '+989364524952';
const PERMISSIONS = ['user.*', 'admin.*'];

(async () => {

  const user = await UserController.createNew({
    firstName: FIRSTNAME,
    lastName: LASTNAME,
    phoneNumber: PHONENUMBER,
    permissions: PERMISSIONS
  });

  console.log('the user', user);

  disconnect();

})();
