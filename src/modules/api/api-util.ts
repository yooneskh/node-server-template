import { ResourceModelProperty } from '../../plugins/resource-maker/resource-model-types';


export function makeHttpParamProperty(key: string, title: string): ResourceModelProperty {
  return {
    key,
    type: 'series',
    serieBase: {},
    serieSchema: [
      {
        key: 'key',
        type: 'string',
        required: true,
        title: 'کلید',
        width: 6
      },
      {
        key: 'type',
        type: 'string',
        enum: ['string', 'number'],
        required: true,
        title: 'نوع',
        items: [
          { value: 'string', text: 'String' },
          { value: 'number', text: 'Number' }
        ],
        width: 6
      }
    ],
    title
  };
}
