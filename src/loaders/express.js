import express from 'express'
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import ejs from 'ejs';
import { client, prefix } from './../config/index.js';
import routes from './../api/routes/index.js';
import { logger } from '../utils/index.js';
import { rateLimiter, session } from '../api/middlewares/index.js';
import bodyParser from 'body-parser';
import { User } from '../models/index.js';
import router from "./../api/routes/index.js";

export default (app) => {
  process.on('uncaughtException', async (error) => {
    // console.log(error);
    logger('00001', '', error.message, 'Uncaught Exception', '');
  });

  process.on('unhandledRejection', async (ex) => {
    // console.log(ex);
    logger('00002', '', ex.message, 'Unhandled Rejection', '');
  });

  app.enable('trust proxy');
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(morgan('dev'));
  app.use(helmet());
  app.use(compression());
  app.disable('x-powered-by');
  app.disable('etag');

  app.engine("html", ejs.renderFile);
  app.set("view engine", "html");
  app.set('views', 'src/views');

  app.use(session);
  app.use(rateLimiter);
  app.use(prefix, routes);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Content-Security-Policy-Report-Only', 'default-src: https:');
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT POST PATCH DELETE GET');
      return res.status(200).json({});
    }
    next();
  });

  app.use((_req, _res, next) => {
    const error = new Error('Page not found!');
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, _next) => {
    res.status(error.status || 500);
    let resultCode = '00015';
    let level = 'External Error';
    if (error.status === 500) {
      resultCode = '00013';
      level = 'Server Error';
    } else if (error.status === 404) {
      resultCode = '00014';
      level = 'Client Error';
    }
    logger(resultCode, req?.user?._id ?? '', error.message, level, req);
    return res.render("error.ejs", {
      site: client,
      user: req.session.user ? User.findOne({ _id: req.session.user }) : null,
      errorNum: error.status || 500,
      errorDesc: error.message,
      errorSlug: `${resultCode}: ${level}`,
    });
  });
}