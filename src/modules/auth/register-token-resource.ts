import { IRegisterToken, IRegisterTokenBase } from './auth-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IRegisterTokenBase, IRegisterToken>('RegisterToken');

maker.addProperties([
  {
    key: 'phoneNumber',
    type: 'string',
    required: true,
    index: true,
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
    default: false,
    index: true,
    title: 'بسته شده'
  },
  {
    key: 'closedAt',
    type: 'number',
    default: 0,
    title: 'زمان بسته شدن'
  }
]);

export const RegisterTokenModel      = maker.getModel();
export const RegisterTokenController = maker.getController();
