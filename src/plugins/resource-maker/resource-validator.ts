import { HandleableError, ServerError } from '../../global/errors';
import { IResource, ResourceModelProperty } from './resource-model-types';
import { Query } from 'mingo';


class ValidationError extends HandleableError {
  public code = 1100;
};


export type ResourceValidation<I> = {
  [P in keyof I]?: ((it: I, e: (message: string) => never) => Promise<unknown>)[]
}

// tslint:disable-next-line: no-any
function conforms(object: any, rule: any): boolean {
  return new Query(rule).test(object);
}

function checkRequiredness(value: unknown, property: ResourceModelProperty): boolean {

  if (property.type === 'number') {
    return (value !== undefined && value !== null && !isNaN(value as number));
  }

  if (property.isArray || property.type === 'series') { // todo: validate sub series
    return (!!value && Array.isArray(value) && value.length > 0);
  }

  if (property.type === 'boolean') {
    return (value === true || value === false);
  }

  return (value !== undefined && value !== null && value !== '');

}


export class ResourceValidator<T extends IResource> {

  private validations: ResourceValidation<T> = {};

  constructor (private name: string, private properties: ResourceModelProperty[], validations: ResourceValidation<T>) {

    for (const property of this.properties) {

      let rules = validations[property.key as keyof T];
      if (!rules) rules = [];

      if (property.required || property.conditionalRequired) {
        rules.unshift(async (it, e) => {
          if (property.vIf && !conforms(it, property.vIf)) return;

          return checkRequiredness(it[property.key as keyof T], property) || e(`${property.title || property.key} الزامی است.`);

        });
      }

      if (property.validator) {
        if (typeof property.validator === 'function') {
          rules.push(async (it, e) => {
            try {
              await (property.validator as Function)(it[property.key as keyof T], it);
            }
            catch (error: any) {
              e(error.responseMessage || error.message || `اشکالی در ${property.title || property.key} وجود دارد.`);
            }
          });
        }
        else if (typeof property.validator === 'string') {

          const regex = new RegExp(property.validator);

          rules.push(async (it, e) => {
            try {
              return regex.test(it[property.key as keyof T] as unknown as string) || e(`مقدار باید به این شکل باشد:‌ ${property.validator}`);
            }
            catch {
              return e(`مقدار باید به این شکل باشد:‌ ${property.validator}`);
            }
          });

        }
        else if (property.validator instanceof RegExp) {
          rules.push(async (it, e) => {
            try {
              return (property.validator as RegExp).test(it[property.key as keyof T] as unknown as string) || e(`شکل مقدار صحیح نیست.`);
            }
            catch {
              return e(`شکل مقدار صحیح نیست.`);
            }
          })
        }
      }

      this.validations[property.key as keyof T] = rules;

    }

  }

  public async validate(item: T) {

    const errorThrowerMaker = (key: string) => (
      (message: string) => {
        throw new ValidationError(
          `validation failed: ${this.name} -- ${key} -- ${message} -- ${JSON.stringify(item)}`,
          message,
          {
            fields: {
              [key]: [message]
            },
            key
          }
        );
      }
    )

    const freezedItem = Object.freeze(JSON.parse(JSON.stringify(item))) as T;

    const checkResults = await Promise.all(
      Object.keys(this.validations)
        .filter(key => {

          const property = this.properties.find(it => it.key === key);
          if (!property) throw new ServerError('no property for a validation.', 'بررسی صحت ممکن نیست.');

          return !property.vIf || conforms(freezedItem, property.vIf);

        })
        .map(async key => {
          try {
            for (const validFn of this.validations[key as keyof T] ?? []) {
              await validFn(freezedItem, errorThrowerMaker(key))
            } return undefined;
          }
          catch (error) {
            return error;
          }
        })
    );

    const errors: ValidationError[] = checkResults.filter(Boolean) as ValidationError[];
    if (errors.length === 0) return;

    const allKeys = errors.map(it => it.extra!.key);
    const allMessages = errors.map(it => it.responseMessage);

    throw new ValidationError(
      `validation failed: ${this.name} -- ${allKeys.join(', ')} -- ${allMessages.join(', ')} -- ${JSON.stringify(item)}`,
      allMessages.join(' - '),
      {
        fields: errors.reduce((a, b) => ({ ...a, ...(b.extra!.fields) }), {})
      }
    )

  }

}
