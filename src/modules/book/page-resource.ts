import { makeResource } from '../../resource-maker/resource-maker';
import { Document } from 'mongoose';

export interface IPage extends Document {
  content: string;
}

export const { model: PageModel, controller: PageController, router: PageRouter } = makeResource<IPage>({
  name: 'Page',
  properties: [
    {
      key: 'content',
      type: 'string'
    },
    {
      key: 'section',
      type: 'string',
      ref: 'Section'
    }
  ]
});
