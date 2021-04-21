import { loadFont, create, ConfigObject, options } from 'svg-captcha';

options.charPreset = '123456789';
options.noise = 5;
options.fontSize = 20;

loadFont(`${process.cwd()}/assets/iranyekan.ttf`);

export async function createCaptcha(captchaOption?: Partial<ConfigObject>) {
  return create({ size: 6, ...captchaOption });
}
