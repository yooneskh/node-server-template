import { IGuideBase, IGuide } from './guide-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IGuideBase, IGuide>('Guide');


maker.addProperties([
  {
    key: 'name',
    type: 'string',
    required: true,
    title: 'نام',
    titleable: true
  },
  {
    key: 'description',
    type: 'string',
    title: 'توضیحات',
    longText: true,
  },
  {
    key: 'body',
    type: 'string',
    title: 'محتوا',
    richText: true,
    hideInTable: true,
    defaultMapLocation: {
      defaultCenter: {
        latitude: 29.6114188,
        longitude: 52.5235707,
      },
    },
  },
]);


export const GuideModel      = maker.getModel();
export const GuideController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', },
  { template: 'LIST_COUNT', },
  { template: 'RETRIEVE', },
  { template: 'CREATE', permissions: ['admin.guide.create'] },
  { template: 'UPDATE', permissions: ['admin.guide.update'] },
  { template: 'DELETE', permissions: ['admin.guide.delete'] }
]);


export const GuideRouter = maker.getRouter();
