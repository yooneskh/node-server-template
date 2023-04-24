import { YNetwork } from 'ynetwork';
import { InvalidRequestError } from '../../global/errors';


export interface IMagfaSmsSend {
  domain: string;
  username: string;
  password: string;
  sendNumber: string;
  receivers: string[];
  text: string;
}

export async function sendMagfaSms({ domain, username, password, sendNumber, receivers, text }: IMagfaSmsSend) {

  const { status, data } = await YNetwork.get(
    `https://sms.magfa.com/magfaHttpService?service=Enqueue&domain=${domain}&username=${username}&passowrd=${password}&from=${sendNumber}&to=${receivers.join(',')}&message=${encodeURI(text)}`
  );

  if (status !== 200) {
    throw new InvalidRequestError('could not send sms: ' + JSON.stringify(data), 'مشکلی در ارسال رخ داده است.');
  }

  return true;

}