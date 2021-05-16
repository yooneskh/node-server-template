import { ICaptcha, ICaptchaBase } from './captcha-interfaces';
import { ResourceMaker } from '../resource-maker/resource-maker';
import { createCaptcha } from './captcha-svg';
import { Config } from '../../global/config';

const maker = new ResourceMaker<ICaptchaBase, ICaptcha>('Captcha');

maker.addProperties([
  {
    key: 'text',
    type: 'string',
    title: 'متن',
    required: true,
    titleable: true
  },
  {
    key: 'validUntil',
    type: 'number',
    required: true,
    title: 'معتبر تا',
    labelFormat: 'jYYYY/jMM/jDD HH:mm:ss'
  },
  {
    key: 'used',
    type: 'boolean',
    default: false,
    title: 'استفاده شده'
  },
  {
    key: 'usedAt',
    type: 'number',
    title: 'زمان استفاده',
    labelFormat: 'jYYYY/jMM/jDD HH:mm:ss'
  },
  {
    key: 'expired',
    type: 'boolean',
    default: false,
    title: 'منقضی شده'
  },
  {
    key: 'expiredAt',
    type: 'number',
    title: 'زمان انقضا',
    labelFormat: 'jYYYY/jMM/jDD HH:mm:ss'
  }
]);

export const CaptchaModel      = maker.getModel();
export const CaptchaController = maker.getController();


maker.addActions([
  { template: 'LIST', permissions: ['admin.captcha.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.captcha.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.captcha.retrieve'] },
  { template: 'CREATE', permissions: ['admin.captcha.create'] },
  { template: 'UPDATE', permissions: ['admin.captcha.update'] },
  { template: 'DELETE', permissions: ['admin.captcha.delete'] },
  { // request
    method: 'POST',
    path: '/request',
    signal: ['Resource', 'Captcha', 'Request'],
    rateLimitOptions: {
      pointsAmount: 3,
      pointsInterval: 60,
      blockDuration: 60,
      consecutiveFailDurationMultiplier: 2
    },
    dataProvider: async ({}) => {

      const { data, text } = await createCaptcha();

      const captcha = await CaptchaController.create({
        payload: {
          text,
          validUntil: Date.now() + Config.captcha.validDuration
        }
      });

      return {
        id: captcha._id,
        data
      };

    }
  }
]);

export const CaptchaRouter = maker.getRouter();
