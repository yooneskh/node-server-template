import { IRegisterTokenBase } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IRegisterTokenBase>('RegisterToken');

maker.addProperties([
  {
    key: 'phoneNumber',
    type: 'string',
    required: true,
    title: 'شماره تلفن',
    titleable: true
  },
  {
    key: 'name',
    type: 'string',
    required: true,
    title: 'نام',
    titleable: true
  },
  {
    key: 'closed',
    type: 'boolean',
    title: 'بسته شده',
    default: false
  },
  {
    key: 'closedAt',
    type: 'number',
    title: 'زمان بسته شدن',
    default: 0
  }
]);

export const RegisterTokenModel      = maker.getModel();
export const RegisterTokenController = maker.getController();
