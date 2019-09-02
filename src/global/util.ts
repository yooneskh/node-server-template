import { ResourceProperty } from '../resource-maker/resource-maker-types';
import { InvalidRequestError } from './errors';

export function simplePascalize(texts: string[]): string {
  return texts
    .map(text => text[0].toUpperCase() + text.slice(1))
    .join('')
}

const addedProperties = {
  _id: 'string',
  createdAt: 'number',
  updatedAt: 'number'
};

// tslint:disable-next-line: no-any
export function validatePropertyKeys(payload: any, properties: ResourceProperty[]) {
  for (const key in payload) {

    if (key in addedProperties) continue;

    const property = properties.find(p => p.key === key);

    if (!property) throw new InvalidRequestError('payload key invalid: ' + key);

  }
}

// tslint:disable-next-line: no-any
export function validatePropertyTypes(payload: any, properties: ResourceProperty[]) {
  // TODO: implmement
}

// tslint:disable-next-line: no-any
export function validatePayload(payload: any, properties: ResourceProperty[]) {
  validatePropertyKeys(payload, properties);
  validatePropertyTypes(payload, properties)
}

export function transformIncludes(includes: Record<string, string>) {

  // tslint:disable-next-line: no-any
  const resultArray: any[][] = [];

  for (const includeKey in includes) {

    const includeKeySeperated = includeKey.split('.');

    const prePops = includeKeySeperated.slice(0, -1);
    const lastPopulate = includeKeySeperated.slice(-1)[0];

    let packIndex = -1;

    for (let i = 0; i < resultArray.length; i++) {
      if (resultArray[i][0] && resultArray[i][0].path === includeKeySeperated[0]) {
        packIndex = i;
        break;
      }
    }

    if (packIndex === -1) {
      resultArray.push([]);
      packIndex = resultArray.length - 1;
    }

    let currentCleanIndex = 0;

    for (const prePop of prePops) {

      if (resultArray[packIndex][currentCleanIndex] && resultArray[packIndex][currentCleanIndex].path !== prePop) {
        throw new InvalidRequestError(`wrong nested include at '${includeKey}', parent must be defined before`);
      }

      currentCleanIndex++;

    }

    resultArray[packIndex].push({
      path: lastPopulate,
      select: includes[includeKey]
    });

  }

  for (const result of resultArray) {
    for (let i = result.length - 1; i >= 1; i--) {
      result[i - 1].populate = result[i];
    }
  }

  return resultArray.map(result => result[0]);

}
