import '../global/database';

import { ensureUser } from '../modules/user/user-controller';
import { disconnect } from 'mongoose';

const FIRSTNAME = 'یونس';
const LASTNAME = 'خوش قدم';
const PHONENUMBER = '+989364524952';
const PERMISSIONS = ['user.*', 'admin.*'];

(async () => {

  const user = await ensureUser({
    firstName: FIRSTNAME,
    lastName: LASTNAME,
    phoneNumber: PHONENUMBER,
    permissions: PERMISSIONS
  });

  console.log('the user', user);

  disconnect();

})();
