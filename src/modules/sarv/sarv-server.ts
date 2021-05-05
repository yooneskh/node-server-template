import YNetwork from 'ynetwork';
import { Config } from '../../global/config';
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

  const { status, result } = await YNetwork.get(Config.sarv.userProfileUrl, undefined, { Authorization: token });
  if (status !== 200) throw new InvalidRequestError(`could not get user profile ${status} ${JSON.stringify(result)}`, 'مشکلی در گرفتن پروفایل کاربری پیش آمده است');

  return result;

}
