import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';


export interface IConditionBase extends IResource {
  title: string;
  type: 'user-property' | 'document-submission';
  property?: string;
  propertyValue?: string;
  document?: string;
} export interface ICondition extends IConditionBase, Document {}


export interface IConditionDocumentBase extends IResource {
  title: string;
  fields: IConditionDocumentField[];
  validityDays?: number;
} export interface IConditionDocument extends IConditionDocumentBase, Document {}

export interface IConditionDocumentField {
  title: string;
  type: string;
  required?: boolean;
}

export interface IConditionDocumentEntryBase extends IResource {
  conditionDocument: string;
  user: string;
  informations: {
    title: string;
    value: string;
  }[];
  files: {
    title: string;
    value: string;
  }[];
} export interface IConditionDocumentEntry extends IConditionDocumentEntryBase, Document {}