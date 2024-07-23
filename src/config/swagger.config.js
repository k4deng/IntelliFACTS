import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  const envFound = config();
  if (envFound.error) throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

const port = Number(process.env.PORT) || 3000;
const secure = process.env.SECURE ? (/true/i).test(process.env.SECURE) : true;
const domain = process.env.DOMAIN || 'localhost:' + port;

export default {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: `${process.env.COMPANY} API`,
      version: '1.0.0'
    },
    basePath: '/api',
    servers: [{
      url: `${secure === true ? 'https' : 'http'}://${domain}/api/`,
    }],
  },
  tags: [{
      "name": "Admin Only",
      "description": "Routes that require admin access"
    },
    {
      "name": "General",
      "description": "Routes that only need an api key"
  }],
  apis: [
    "src/utils/helpers/*.js",
    "src/api/middlewares/auth/*.js",
    "src/api/controllers/api/*.js",
  ]
};