import { IProduct } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-router-enums';


const maker = new ResourceMaker<IProduct>('Product');

maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'description',
    type: 'string',
    title: 'توضیحات'
  },
  {
    key: 'price',
    type: 'number',
    required: true,
    title: 'قیمت'
  },
  {
    key: 'picture',
    type: 'string',
    ref: 'Media',
    title: 'تصویر'
  },
  {
    key: 'album',
    type: 'string',
    ref: 'Media',
    isArray: true,
    title: 'آلبوم'
  },
  {
    key: 'meta',
    type: 'object',
    default: {},
    hidden: true
  }
]);

export const ProductModel      = maker.getModel();
export const ProductController = maker.getController();


maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const ProductRouter = maker.getRouter();
