import { HandleableError } from '../../global/errors';
import { IResource, ResourceModelProperty } from './resource-model-types';


class ValidationError extends HandleableError {
  public code = 1100;
};

export type ResourceValidation<I> = {
  [P in keyof I]?: ((it: I, e: (message: string) => never) => Promise<unknown>)[]
}

export class ResourceValidator<T extends IResource> {

  private validations: ResourceValidation<T> = {};

  constructor (private name: string, private properties: ResourceModelProperty[], validations: ResourceValidation<T>) {

    for (const property of this.properties) {

      let rules = validations[property.key as keyof T];

      if (property.required) {
        if (!rules) rules = [];
        rules.unshift(async (it, e) => {
          const v = it[property.key as keyof T] as any; // tslint:disable-line: no-any
          if (property.type === 'number' && (v !== undefined && v !== null && !isNaN(v))) return;
          if ((property.isArray || property.type === 'series') && (!!v && v.length > 0)) return;
          return v !== undefined && v !== null && v !== '' || e(`${property.title || property.key} الزامی است.`);
        });
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
      Object.keys(this.validations).map(async key => {
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

    const errors: ValidationError[] = checkResults.filter(Boolean);
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
