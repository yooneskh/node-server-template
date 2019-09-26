import { connect } from 'mongoose';
import { Config } from './config';

if (!Config.database.host || !Config.database.port || !Config.database.name) throw new Error('database config not set');

const DB_URI = `mongodb://${Config.database.host}:${Config.database.port}/${Config.database.name}`;

connect(DB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
