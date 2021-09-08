import { YNetwork } from 'ynetwork';
import { Config } from '../../config/config';
import { InvalidRequestError } from '../../global/errors';

interface SSOUser {
  name?: string;
  sub: string;
  email_verified?: boolean;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
}

export async function getSSOUserByToken(token: string): Promise<SSOUser> {

  const url = Config.sso.userInfoUrl;

  const { status, data } = await YNetwork.get(url, undefined, { 'Authorization': `Bearer ${token}` });
  if (status !== 200) throw new InvalidRequestError('could not get user information from sso', 'اطلاعات کاربر دریافت نشد.');

  return data;

}
