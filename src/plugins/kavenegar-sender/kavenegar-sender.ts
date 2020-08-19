import * as YNetwork from 'ynetwork';
import { Config } from '../../global/config';

const API_KEY = Config.kavenegar.apiKey;

export interface LookupSMSOptions {
  receptor: string;
  template: string;
  token: string;
  token2?: string;
  token3?: string;
  type?: string;
}

export async function sendLookupSMS(options: LookupSMSOptions) {

  let url = `https://api.kavenegar.com/v1/${API_KEY}/verify/lookup.json?receptor=${options.receptor}&template=${options.template}&token=${encodeURIComponent(options.token)}&type=${options.type ?? 'sms'}`;
  if (options.token2) url += `&token2=${encodeURIComponent(options.token2)}`;
  if (options.token3) url += `&token3=${encodeURIComponent(options.token3)}`;

  const { status } = await YNetwork.get(url);
  if (status !== 200) throw new Error(`could not send lookup sms ${options}`);

}

export interface DirectSMSOptions {
  receptors: string[];
  sender: string;
  message: string;
}

export async function sendDirectSMS(options: DirectSMSOptions) {

  const url = `https://api.kavenegar.com/v1/${API_KEY}/sms/send.json?receptor=${options.receptors.join(',')}&sender=${options.sender}&message=${encodeURIComponent(options.message)}`;

  const { status } = await YNetwork.get(url);
  if (status !== 200) throw new Error(`could not send direct sms ${options}`);

}
