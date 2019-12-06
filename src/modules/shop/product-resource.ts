import { IResource } from '../../plugins/resource-maker/resource-maker-types';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-enums';

export interface IProduct extends IResource {
  title: string;
  price: number;
  picture: string;
  album: string[];
  description: string;
  // tslint:disable-next-line: no-any
  meta: any;
}

const maker = new ResourceMaker<IProduct>('Product');

maker.setProperties([
  {
    key: 'title',
    type: 'string',
    required: true
  },
  {
    key: 'description',
    type: 'string'
  },
  {
    key: 'price',
    type: 'number',
    required: true
  },
  {
    key: 'picture',
    type: 'string',
    ref: 'Media'
  },
  {
    key: 'album',
    type: 'string',
    ref: 'Media',
    isArray: true
  },
  {
    key: 'meta',
    type: 'object'
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

export const { model: ProductModel, controller: ProductController, router: ProductRouter } = maker.getMCR();
