import { getUserByPhoneNumber, ensureUser } from '../user/user-controller';
import { IUser } from '../user/user-model';
import { InvalidRequestError } from '../../global/errors';

export async function loginUser(phoneNumber: string) {

  const user = await getUserByPhoneNumber(phoneNumber);

  // TODO: make verification code
  user.verificationCode = '111111';

  await user.save();

  return true;

}

export async function registerUser({firstName = '', lastName = '', phoneNumber = ''}): Promise<IUser> {

  const user = await ensureUser({
    firstName: firstName,
    lastName: lastName,
    phoneNumber: phoneNumber,
    permissions: ['user.*']
  });

  // TODO: make verification code
  user.verificationCode = '111111';

  return user.save();

}

export async function verifyUser({phoneNumber = '', verificationCode = ''}): Promise<IUser> {

  const user = await getUserByPhoneNumber(phoneNumber);

  if (!verificationCode || !user.verificationCode || verificationCode !== user.verificationCode) throw new InvalidRequestError('invalid code');

  user.verificationCode = undefined;

  // TODO: make token
  user.token = 'asdjfasjkdfhsladhf';

  return user.save();

}
