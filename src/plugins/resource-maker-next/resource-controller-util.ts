import { ResourceModelProperty } from './resource-model-types';
import { InvalidRequestError } from '../../global/errors';

const GENERAL_RESOURCE_PROPERIES = {
  _id: 'string',
  createdAt: 'number',
  updatedAt: 'number'
};

// tslint:disable-next-line: no-any
export function validatePropertyKeys(payload: Record<string, any>, properties: ResourceModelProperty[], twoWayCheck = false) {

  for (const key in payload) {

    if (key in GENERAL_RESOURCE_PROPERIES) continue;

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
        throw new InvalidRequestError(`property '${requiredProperty.key}' is required!`);
      }
    }
  }

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
