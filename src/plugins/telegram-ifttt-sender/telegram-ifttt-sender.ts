import { YNetwork } from 'ynetwork';
import { Config } from '../../config/config';

const TELEGRAM_KEY = Config.ifttt.telegram.key;

export async function triggerTelegramWebhook(eventName: string, message: string) {

  const url = `https://maker.ifttt.com/trigger/${eventName}/with/key/${TELEGRAM_KEY}`;
  const { status } = await YNetwork.post(url, { value1: message });
  if (status !== 200) throw new Error(`could not send lookup sms :: ${eventName} :: ${message}`);

}
