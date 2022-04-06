import { YNetwork } from 'ynetwork';
import { Config } from '../../config/config';
import { InvalidRequestError } from '../../global/errors';


interface IParsianPaymentRequestConfig {
  loginAccount: string;
  amount: number;
  callbackUrl: string;
  orderId: string;
}

export async function makeParsianPaymentRequest(config: IParsianPaymentRequestConfig) {

  const xmls = `
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:sal="https://pec.Shaparak.ir/NewIPGServices/Sale/SaleService">
      <soap:Header/>
      <soap:Body>
        <sal:SalePaymentRequest>
          <sal:requestData>
            <sal:LoginAccount>${config.loginAccount}</sal:LoginAccount>
            <sal:Amount>${config.amount}</sal:Amount>
            <sal:OrderId>${parseInt(String(config.orderId).slice(0, 8), 16)}</sal:OrderId>
            <sal:CallBackUrl>${config.callbackUrl}</sal:CallBackUrl>
          </sal:requestData>
        </sal:SalePaymentRequest>
      </soap:Body>
    </soap:Envelope>
  `;

  let data;
  let status;

  if (Config.parsian.proxy.enabled) {

    const response = await YNetwork[Config.parsian.proxy.method](Config.parsian.proxy.url, {
      method: 'post',
      url: Config.parsian.paymentRequestUrl,
      payload: xmls,
      headers: {
        'Content-Type': 'text/xml'
      }
    });

    data = response.data;
    status = response.status;

  }
  else {

    const response = await YNetwork.post(Config.parsian.paymentRequestUrl, xmls, { 'Content-Type': 'text/xml' });

    data = response.data;
    status = response.status;

  }


  const regex = /^.*<Token>(\d+)<\/Token>.*$/;
  const matchResult = regex.exec(data);

  if (!matchResult) {
    console.error(`parsian request error ${status} :: ${JSON.stringify(data)}`, 'درخواست پرداخت ثبت نشد.');
    throw new InvalidRequestError(`parsian request error ${status} :: ${JSON.stringify(data)}`, 'درخواست پرداخت ثبت نشد.');
  }

  return {
    token: matchResult[1]
  };

}


interface IParsianPaymentVerifyConfig {
  loginAccount: string;
  token: string;
}

export async function makeParsianPaymentVerify(config: IParsianPaymentVerifyConfig) {

  const xmls = `
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:con="https://pec.Shaparak.ir/NewIPGServices/Confirm/ConfirmService">
      <soap:Header/>
      <soap:Body>
        <con:ConfirmPayment>
          <con:requestData>
            <con:LoginAccount>${config.loginAccount}</con:LoginAccount>
            <con:Token>${config.token}</con:Token>
          </con:requestData>
        </con:ConfirmPayment>
      </soap:Body>
    </soap:Envelope>
  `;

  let data;
  let status;

  if (Config.parsian.proxy.enabled) {

    const response = await YNetwork[Config.parsian.proxy.method](Config.parsian.proxy.url, {
      method: 'post',
      url: Config.parsian.paymentVerificationUrl,
      payload: xmls,
      headers: {
        'Content-Type': 'text/xml'
      }
    });

    data = response.data;
    status = response.status;

  }
  else {

    const response = await YNetwork.post(Config.parsian.paymentVerificationUrl, xmls, { 'Content-Type': 'text/xml' });

    data = response.data;
    status = response.status;

  }


  const regex = /^.*<ConfirmPaymentResult>(\d+)<\/ConfirmPaymentResult>.*$/;
  const matchResult = regex.exec(data);

  if (!matchResult) {
    console.error(`parsian verify error ${status} :: ${JSON.stringify(data)}`, 'پرداخت تایید نشد.');
    throw new InvalidRequestError(`parsian verify error ${status} :: ${JSON.stringify(data)}`, 'پرداخت تایید نشد.');
  }


  const contentKeys = ['Status', 'RRN', 'CardNumberMasked'];

  const result = {
    Status: '',
    RRN: '',
    CardNumberMasked: ''
  };

  for (const key in contentKeys) {

    const keyRegex = new RegExp(`^.*<ConfirmPaymentResult>.*<${key}>(.+)<\\/${key}>.*<\\/ConfirmPaymentResult>.*$`);
    const keyMatchResult = keyRegex.exec(data);

    if (!keyMatchResult) {
      console.error(`parsian verification result does not have ${key} key :: ${status} :: ${data}`);
      throw new InvalidRequestError(`parsian verification result does not have ${key} key :: ${status} :: ${data}`);
    }

    result[key as 'RRN' | 'Status' | 'CardNumberMasked'] = keyMatchResult[1];

  }

  return result;

}
