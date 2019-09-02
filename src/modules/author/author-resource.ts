import { makeResource } from '../../resource-maker/resource-maker';
import { Document } from 'mongoose';
import { ResourceRelationActionTemplate, ResourceActionTemplate } from '../../resource-maker/resource-router';

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
  actions: [
    { template: ResourceActionTemplate.LIST },
    { template: ResourceActionTemplate.CREATE },
    { template: ResourceActionTemplate.UPDATE },
    { template: ResourceActionTemplate.DELETE }
  ],
  relations: [
    {
      targetModelName: 'Book',
      singular: true,
      properties: [
        {
          key: 'timeTook',
          type: 'number'
        }
      ],
      actions: [
        { template: ResourceRelationActionTemplate.LIST },
        { template: ResourceRelationActionTemplate.LIST_COUNT },
        { template: ResourceRelationActionTemplate.RETRIEVE },
        { template: ResourceRelationActionTemplate.RETRIEVE_COUNT },
        { template: ResourceRelationActionTemplate.CREATE },
        { template: ResourceRelationActionTemplate.DELETE }
      ]
    }
  ]
});
