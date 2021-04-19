import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

interface CaptchaOptions {
  enabled: boolean;
}

declare module '../../plugins/resource-maker/resource-router-types' {
  interface ResourceRouterAction {
    captchaOptions?: CaptchaOptions;
  }
}

export interface ICaptchaBase extends IResource {
  data: string;
  text: string;
  validUntil: number;
  used: boolean;
  usedAt: number;
  expired: boolean;
  expiredAt: number;
} export interface ICaptcha extends ICaptchaBase, Document {}
