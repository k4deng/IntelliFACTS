import mongooseLoader from './mongoose.js';
import expressLoader from './express.js';
import updaterLoader from './updater.js';

export default async (app) => {
  await mongooseLoader();
  expressLoader(app);
  await updaterLoader();
}