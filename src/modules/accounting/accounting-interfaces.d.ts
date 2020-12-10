import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IAccountBase extends IResource {
  title?: string;
  user: string;
  balance: number;
  acceptsInput: boolean;
  acceptsOutput: boolean;
  allowNegativeBalance: boolean;
  meta: any
} export interface IAccount extends IAccountBase, Document {}

export interface ITransactionBase extends IResource {
  account: string;
  amount: number;
  description: string;
} export interface ITransaction extends ITransactionBase, Document {}

export interface ITransferBase extends IResource {
  fromAccount: string;
  fromTransaction: string;
  toAccount: string;
  toTransaction: string;
  amount: number;
  description: string;
} export interface ITransfer extends ITransferBase, Document {}
