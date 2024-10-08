export { default as swaggerConfig } from './swagger.config.js'
import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  const envFound = config();
  if (envFound.error) throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export const nodeEnv = process.env.NODE_ENV || 'production';

export const dbUri = process.env.DB_URI;
export const dbName = process.env.DB_NAME;

export const port = Number(process.env.PORT) || 3000;
export const secure = process.env.SECURE ? (/true/i).test(process.env.SECURE) : true;
export const domain = process.env.DOMAIN || 'localhost:' + this.port;

export const client = {
  name: process.env.COMPANY,
  desc: process.env.DESCRIPTION,
  supportEmail: process.env.SUPPORT_EMAIL,
  url: `${secure === true ? 'https' : 'http'}://${domain}`
};

export const sessionSecret = process.env.SESSION_SECRET;

export const prefix= '/';

export const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
export const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

export const discordToken = process.env.DISCORD_TOKEN;
export const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
export const discordServerId = process.env.DISCORD_SERVER_ID;