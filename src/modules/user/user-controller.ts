import { User, IUser } from './user-model';
import { NotFoundError } from '../../global/errors';

export async function ensureUser({userId = '', firstName = '', lastName = '', phoneNumber = '', permissions = [] as string[]}): Promise<IUser> {

  let user;

  if (userId) {
    user = await User.findById(userId);
  }
  else {
    user = new User();
  }

  if (!user) throw new NotFoundError('user not found');

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (permissions) user.permissions = permissions;

  user.verificationCode = undefined;
  user.token = undefined;

  return user.save();

}

export async function getUserByToken(token: string, silent = false): Promise<IUser> {

  const user = await User.findOne({ token });

  if (!user) throw new NotFoundError('user not found');

  return user;

}

export async function getUserByTokenSilent(token: string): Promise<IUser | undefined> {

  const user = await User.findOne({ token });

  if (!user) return undefined;

  return user;

}

export async function getUserByPhoneNumber(phoneNumber: string): Promise<IUser> {

  const user = await User.findOne({ phoneNumber });

  if (!user) throw new NotFoundError('user not found');

  return user;

}
