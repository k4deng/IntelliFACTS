export { default as swaggerConfig } from './swagger.config.js'
import { config } from 'dotenv';

//NOTE: If you are running the project in an instance, you should store these secret keys in its configuration settings.
// This type of storing secret information is only experimental and for the purpose of local running.

const envFound = config();
if (envFound.error) throw new Error("⚠️  Couldn't find .env file  ⚠️");

export const nodeEnv = process.env.NODE_ENV || 'production';

export const dbUri = process.env.DB_URI;
export const dbName = process.env.DB_NAME;

export const novuApiKey = process.env.NOVU_API_KEY;

export const port = Number(process.env.PORT) || 3000;
export const secure = process.env.SECURE ? (/true/i).test(process.env.SECURE) : true;
export const domain = process.env.DOMAIN || 'localhost:' + this.port;

export const client = {
  name: process.env.COMPANY,
  desc: process.env.DESCRIPTION,
  url: `${secure === true ? 'https' : 'http'}://${domain}`
};

export const sessionSecret = process.env.SESSION_SECRET;

export const prefix= '/';
export const docsPrefix= '/docs';