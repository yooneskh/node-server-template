import { makeResource } from '../../resource-maker/resource-maker';
import { Document } from 'mongoose';

export interface ISection extends Document {
  title: string;
}

export const { model: SectionModel, controller: SectionController, router: SectionRouter } = makeResource<ISection>({
  name: 'Section',
  properties: [
    {
      key: 'title',
      type: 'string'
    }
  ]
});
