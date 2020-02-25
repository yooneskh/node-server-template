import { ResourceModelProperty } from './resource-model-types';
import { ServerError } from '../../global/errors';

export class ResourceModel {

  private properties: ResourceModelProperty[] = [];

  constructor(private name: string) { }

  public addProperty(property: ResourceModelProperty) {

    if (this.properties.find(p => p.key === property.key)) throw new ServerError(`duplicate property key '${property.key}'`);

    this.properties.push(property);

  }

  private makeSchema() {

  }

  public getModel() {

  }

}
