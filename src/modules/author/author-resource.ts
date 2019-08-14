import { makeResource } from '../../resource-maker/resource-maker';
import { Document } from 'mongoose';

export interface IAuthor extends Document {
  familyName: string;
}

export const { model: AuthorModel, controller: AuthorController, router: AuthorRouter } = makeResource<IAuthor>({
  name: 'Author',
  properties: [
    {
      key: 'familyName',
      type: 'string'
    }
  ],
  relations: [
    {
      targetModelName: 'Book',
      properties: [
        {
          key: 'timeTook',
          type: 'number'
        }
      ]
    }
  ]
});
