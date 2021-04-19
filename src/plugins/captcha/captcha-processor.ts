import { ForbiddenAccessError, InvalidRequestError, InvalidStateError } from '../../global/errors';
import { ResourceRouter } from '../resource-maker/resource-router';
import { CaptchaController } from './captcha-resource';

ResourceRouter.addPreProcessor(async ({ action, payload }) => {
  if (!action.captchaOptions || !action.captchaOptions.enabled) return;

  const { captchaId, captchaText } = payload;
  if (!captchaId || !captchaText) throw new ForbiddenAccessError('captcha information not sent');

  const captchas = await CaptchaController.list({ filters: { _id: captchaId } });
  if (captchas.length !== 1) throw new InvalidRequestError('invalid captcha id');

  const captcha = captchas[0];
  if (captcha.expired || captcha.used) throw new InvalidStateError('captcha is expired');

  if (Date.now() >= captcha.validUntil) {

    await CaptchaController.edit({
      resourceId: captcha._id,
      payload: {
        expired: true,
        expiredAt: Date.now()
      }
    });

    throw new InvalidStateError('captcha is expired');

  }

  await CaptchaController.edit({
    resourceId: captcha._id,
    payload: {
      used: true,
      usedAt: Date.now()
    }
  });

});
