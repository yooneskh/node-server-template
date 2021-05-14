import { ResourceRouter } from '../resource-maker/resource-router';
import { sanitizelHtmlStrict } from './html-sanitizer';


// tslint:disable-next-line: no-any
function sanitizeThing(thing: any): any {
  if (typeof thing === 'string') return sanitizelHtmlStrict(thing);
  if (Array.isArray(thing)) return thing.map(sanitizeThing);
  if (typeof thing !== 'object' || !thing) return thing;

  // tslint:disable-next-line: no-any
  const result: Record<string, any> = {};

  for (const key in thing) {
    result[sanitizelHtmlStrict(key)] = sanitizeThing(thing[key]);
  }

  return result;

}

ResourceRouter.addPreProcessor(async context => {
  if (context.request.headers) context.request.headers = sanitizeThing(context.request.headers);
  if (context.request.headers.authorization) context.request.headers.authorization = sanitizeThing(context.request.headers.authorization)
  if (context.request.query['x-token']) context.request.query['x-token'] = sanitizeThing(context.request.query['x-token']);
  if (context.payload) context.payload = sanitizeThing(context.payload);
  if (context.params) context.params = sanitizeThing(context.params);
  if (context.query) context.query = sanitizeThing(context.query);
});
