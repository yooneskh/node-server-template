import { IResource } from '../../resource-maker/resource-maker-types';
import { ResourceMaker } from '../../resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../resource-maker/resource-maker-enums';
import { Config } from '../../global/config';

export interface IBook extends IResource {
  name: {
    en: string,
    fa: string
  };
  page: string;
}

const maker = new ResourceMaker<IBook>('Book');

maker.setProperties([
  {
    key: 'name',
    type: 'string',
    required: true,
    languages: Config.languages
  }
]);

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: BookModel, controller: BookController, router: BookRouter } = maker.getMCR();
