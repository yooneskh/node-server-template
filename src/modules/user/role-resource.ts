import { IRole, IRoleBase } from './user-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IRoleBase, IRole>('Role');


maker.addProperties([
  {
    key: 'name',
    type: 'string',
    title: 'نام کامل',
    disabled: true,
    titleable: true
  },
  {
    key: 'permissions',
    type: 'string',
    isArray: true,
    default: ['user.*'],
    title: 'مجوزها',
    hideInTable: true,
    handlerElement: 'permissions'
  },
]);


export const RoleModel      = maker.getModel();
export const RoleController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', /* permissions: ['admin.role.list']  */},
  { template: 'LIST_COUNT', /* permissions: ['admin.role.list-count']  */},
  { template: 'RETRIEVE', /* permissions: ['admin.role.retrieve']  */},
  { template: 'CREATE', /* permissions: ['admin.role.create']  */},
  { template: 'UPDATE', /* permissions: ['admin.role.update']  */},
  { template: 'DELETE', /* permissions: ['admin.role.delete']  */}
]);


export const RoleRouter = maker.getRouter();
