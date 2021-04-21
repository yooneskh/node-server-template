import { HandleableError } from '../../global/errors';
import { IResource } from './resource-model-types';


class ValidationError extends HandleableError {
  public code = 1100;
};

export type ResourceValidation<I> = {
  [P in keyof I]?: ((it: I, e: (message: string) => never) => Promise<unknown>)[]
}

export class ResourceValidator<T extends IResource> {

  constructor (private name: string, private validations: ResourceValidation<T>) {}

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
