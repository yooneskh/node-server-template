import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  permissions: string[];
  verificationCode: string | undefined;
  token: string | undefined;
}

const UserSchema = new Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  permissions: [{
    type: String
  }],
  veriifcationCode: {
    type: String
  },
  token: {
    type: String
  }
});

export const User = model<IUser>('User', UserSchema);
