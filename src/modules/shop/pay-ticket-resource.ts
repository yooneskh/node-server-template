import { IResource } from '../../plugins/resource-maker/resource-maker-types';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-enums';

export interface IPayTicket extends IResource {
  factor: string;
  gateway: string;
}

const maker = new ResourceMaker<IPayTicket>('PayTicket');

maker.setProperties([
  {
    key: 'factor',
    type: 'string',
    required: true,
    ref: 'Factor'
  },
  {
    key: 'gateway',
    type: 'string',
    required: true
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

export const { model: PayTicketModel, controller: PayTicketController, router: PayTicketRouter } = maker.getMCR();
