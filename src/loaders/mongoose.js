import mongoose from 'mongoose';

import { dbName, dbUri } from '../config/index.js';

export default async () => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(dbUri,{ dbName: dbName })
    .then(() => {
      console.log('Mongodb Connection');
    })
    .catch(err => {
      console.log(err);
    });
};