import { makeResource } from '../../resource-maker/resource-maker';
import { Document } from 'mongoose';

export interface IBook extends Document {
  name: string;
}

export const { model: BookModel, controller: BookController, router: BookRouter } = makeResource<IBook>({
  name: 'Book',
  properties: [
    {
      key: 'name',
      type: 'string'
    }
  ]
});
