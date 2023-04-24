import { YNetwork } from 'ynetwork';
import { InvalidRequestError } from '../../global/errors';
import { Config } from '../../config/config';


export interface IMagfaSmsSend {
  domain: string;
  username: string;
  password: string;
  sendNumber: string;
  receivers: string[];
  text: string;
}

export async function sendMagfaSms({ domain, username, password, sendNumber, receivers, text }: IMagfaSmsSend) {

  const url = `https://sms.magfa.com/magfaHttpService?service=Enqueue&domain=${domain}&username=${username}&password=${password}&from=${sendNumber}&to=${receivers.join(',')}&message=${encodeURI(text)}`;

  const { status, data } = await YNetwork.post(`${Config.media.baseUrl}/433344/proxy`, {
    method: 'get',
    url,
  });

  if (status !== 200) {
    throw new InvalidRequestError('could not send sms: ' + JSON.stringify(data), 'مشکلی در ارسال رخ داده است.');
  }

  return true;

}