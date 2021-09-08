import { YNetwork } from 'ynetwork';
import { Config } from '../../config/config';
import { InvalidRequestError } from '../../global/errors';

interface ISarvUser {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  fatherName?: string;
  dateOfBirth?: string;
  address?: string;
  type?: string;
  nationalCode?: string;
  companyName?: string;
  companyRegistrationDate?: string;
  companyType?: string;
  economicalCode?: string;
  registrationCode?: string;
}

export async function getUserProfile(token: string): Promise<ISarvUser> {

  const { status, data } = await YNetwork.get(Config.sarv.userProfileUrl, undefined, { Authorization: token });
  if (status !== 200) throw new InvalidRequestError(`could not get user profile ${status} ${JSON.stringify(data)}`, 'مشکلی در گرفتن پروفایل کاربری پیش آمده است');

  return data;

}

export async function logoutUser(token: string): Promise<Boolean> {

  const { status, data } = await YNetwork.post(Config.sarv.userLogoutUrl, {}, { Authorization: token });
  if (status !== 200) throw new InvalidRequestError(`could not logout user ${status} ${JSON.stringify(data)}`, 'مشکلی در خروج پیش آمده است.');

  return data;

}
