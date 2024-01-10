import mongoose from 'mongoose';
import { RateLimiterMongo } from 'rate-limiter-flexible';
import {client, dbName, dbUri} from '../../config/index.js';
import { errorHelper } from '../../utils/index.js';
import {User} from "../../models/index.js";

mongoose.set("strictQuery", false);

const opts = {
  storeClient: mongoose.createConnection(dbUri, { dbName: dbName }),
  tableName: 'rateLimits',
  points: 150, // x requests
  duration: 60 // per y second by IP
};

export default (req, res, next) => {
  const rateLimiterMongo = new RateLimiterMongo(opts);
  rateLimiterMongo.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(async (err) => {
      return res.status(429).render("error.ejs", {
        site: client,
        user: req.session.user ? await User.findOne({ _id: req.session.user }) : null,
        errorNum: 429,
        errorDesc: errorHelper('rateLimiter.tooManyRequests', req, err.message).resultMessage.en,
        errorSlug: `Please slow down just a little bit!`,
      });
    });
}