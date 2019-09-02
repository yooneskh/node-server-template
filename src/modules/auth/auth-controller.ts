import { InvalidRequestError } from '../../global/errors';
import { UserController, IUser } from '../user/user-resource';
import { generateToken } from '../../global/util';

export async function loginUser(phoneNumber: string) {

  const user = await UserController.findOne({ filters: { phoneNumber }});

  // user.verificationCode = generateRandomNumericCode(6);
  user.verificationCode = '111111';

  await user.save();

  return true;

}

export async function registerUser({firstName = '', lastName = '', phoneNumber = ''}): Promise<IUser> {

  const user = await UserController.createNew({
    payload: {
      firstName,
      lastName,
      phoneNumber,
      permissions: ['user.*'],
      verificationCode: undefined,
      token: undefined
    }
  });

  // user.verificationCode = generateRandomNumericCode(6);
  user.verificationCode = '111111';

  return user.save();

}

export async function verifyUser({phoneNumber = '', verificationCode = ''}): Promise<IUser> {

  const user = await UserController.findOne({ filters: { phoneNumber }});

  if (!verificationCode || !user.verificationCode || verificationCode !== user.verificationCode) throw new InvalidRequestError('invalid code');

  user.verificationCode = undefined;

  // TODO: make sure is unique
  user.token = generateToken();

  return user.save();

}
