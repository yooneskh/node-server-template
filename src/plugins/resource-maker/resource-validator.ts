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
            }
          }
        );
      }
    )

    const freezedItem = Object.freeze(JSON.parse(JSON.stringify(item))) as T;

    await Promise.all(
      Object.keys(this.validations).map(async key => {
        for (const validFn of this.validations[key as keyof T] ?? []) {
          await validFn(freezedItem, errorThrowerMaker(key))
        }
      })
    );

  }

}
