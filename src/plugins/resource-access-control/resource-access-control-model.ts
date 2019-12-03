import { ResourceMaker } from '../resource-maker/resource-maker';
import { IResource } from '../resource-maker/resource-maker-types';
import { ResourceActionTemplate } from '../resource-maker/resource-maker-enums';

export interface IPermit extends IResource {
  user: string;
  resource: string;
  readPermit: boolean;
  updatePermit: boolean;
  deletePermit: boolean;
};

export function createResourcePermitResource(resourceName: string) {

  const maker = new ResourceMaker<IPermit>(`User${resourceName}Permit`);

  maker.setProperties([
    {
      key: 'user',
      type: 'string',
      ref: 'User',
      required: true
    },
    {
      key: 'resource',
      type: 'string',
      ref: resourceName,
      required: true
    },
    {
      key: 'readPermit',
      type: 'boolean',
      default: false
    },
    {
      key: 'updatePermit',
      type: 'boolean',
      default: false
    },
    {
      key: 'deletePermit',
      type: 'boolean',
      default: false
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

  return maker.getMCR();

}
