import { Document, Model } from 'mongoose';

interface R {
  createdAt: number;
}

interface RD extends Document {
  createdAt: number;
}

interface A extends R {
  fullName: string;
}

interface AA extends A, Document {};

class Test<T extends R, F extends RD> {
  public simpleAge: T;
  public age: Model<F>
}

const vas = new Test<A, AA>();

vas.age.full