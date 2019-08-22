import { makeResource } from '../../resource-maker/resource-maker';
import { Document } from 'mongoose';
import { ResourceActionTemplate } from '../../resource-maker/resource-router';

export interface IBook extends Document {
  name: string;
  page: string;
}

export const { model: BookModel, controller: BookController, router: BookRouter } = makeResource<IBook>({
  name: 'Book',
  properties: [
    {
      key: 'name',
      type: 'string'
    },
    {
      key: 'page',
      type: 'string',
      ref: 'Page'
    }
  ],
  actions: [
    { template: ResourceActionTemplate.LIST },
    { template: ResourceActionTemplate.CREATE },
    { template: ResourceActionTemplate.UPDATE },
    { template: ResourceActionTemplate.DELETE }
  ]
});
