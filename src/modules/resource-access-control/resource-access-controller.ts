import { ResourceController } from '../../resource-maker/resource-controller';
import { IResource } from '../../resource-maker/resource-maker-types';
import { ResourceRelationController } from '../../resource-maker/resource-relation-controller';

export class PermittedResourceController<T extends IResource> extends ResourceController<T> {

}

export class PermittedResourceRelationController<T extends IResource> extends ResourceRelationController<T> {

}
