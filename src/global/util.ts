import { InvalidRequestError } from './errors';
import { randomBytes, createHash } from 'crypto';
import { ResourceModelProperty } from '../plugins/resource-maker-next/resource-model-types';

export function simplePascalize(texts: string[]): string {
  return texts
    .map(text => text[0].toUpperCase() + text.slice(1))
    .join('')
}

export function rand(from: number, to: number) {
  return Math.trunc(Math.random() * (to - from) + from);
}

export function generateToken() {
  return randomBytes(32).toString('hex');
}

export function md5Hash(data: string) {
  return createHash('md5').update(data).digest('hex');
}

export function generateRandomNumericCode(length: number) {

  let res = '';

  for (let i = 0; i < length; i++) {
    res += parseInt((Math.random() * 10).toString(10), 10);
  }

  return res;

}

const addedProperties = {
  _id: 'string',
  createdAt: 'number',
  updatedAt: 'number'
};

// tslint:disable-next-line: no-any
export function validatePropertyKeys(payload: any, properties: ResourceModelProperty[], twoWayCheck = false) {

  for (const key in payload) {

    if (key in addedProperties) continue;

    const property = properties.find(p => p.key === key);

    if (!property) throw new InvalidRequestError('payload key invalid: ' + key);

    if (property.languages) {

      if (typeof payload[key] !== 'object') throw new InvalidRequestError(`payload ${key} is not multi language`);

      for (const languageKey in payload[key]) {
        if (!(languageKey in property.languages)) {
          throw new InvalidRequestError(`language key '${languageKey}' is invalid!`);
        }
      }

    }

  }

  if (twoWayCheck) {
    for (const requiredProperty of properties.filter(property => property.required)) {
      if (!(requiredProperty.key in payload)) {
        throw new InvalidRequestError(`propery '${requiredProperty.key}' is required!`);
      }
    }
  }

}

// tslint:disable-next-line: no-any
export function validatePropertyTypes(payload: any, properties: ResourceModelProperty[]) {
  // TODO: implmement
}

// tslint:disable-next-line: no-any
export function validatePayload(payload: any, properties: ResourceModelProperty[], twoWayCheck = false) {
  validatePropertyKeys(payload, properties, twoWayCheck);
  validatePropertyTypes(payload, properties)
}

interface MongoosePopulate {
  path: string;
  select: string;
  populate: MongoosePopulate[];
}

export function transformIncludes(includes: Record<string, string>) {

  const populates: MongoosePopulate[] = [];

  for (const includeKey in includes) {

    const includeParts = includeKey.split('.');
    let hay = populates;

    for (const includePart of includeParts.slice(0, -1)) {

      const targetPopulate = hay.find(p => p.path === includePart);
      if (!targetPopulate) throw new InvalidRequestError(`wrong nested include at '${includeKey}', parent must be defined before`)

      hay = targetPopulate.populate;

    }

    hay.push({
      path: includeParts.slice(-1)[0],
      select: includes[includeKey],
      populate: []
    });

  }

  return populates;

}
