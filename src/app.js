import express from 'express';
import { port, secure, domain, nodeEnv } from './config/index.js';
import loader from './loaders/index.js';
import { logger } from "./utils/index.js";

const app = express();

loader(app);

process.on('uncaughtException', async (error) => {
  if (nodeEnv !== 'production') console.log(error);
  logger('app.uncaughtException', '', error.message, 'Uncaught Exception', '');
});

process.on('unhandledRejection', async (ex) => {
  if (nodeEnv !== 'production') console.log(ex);
  logger('app.unhandledRejection', '', ex.message, 'Unhandled Rejection', '');
});

app.listen(port, err => {
  if (err) {
    console.log(err);
    return process.exit(1);
  }
  console.log(`Server is running on port ${port} at ${secure === true ? 'https' : 'http'}://${domain}`);
});

export default app