import session from 'express-session'
import MongoStore from 'connect-mongo'
import { sessionSecret, secure, dbUri, dbName } from "../../../config/index.js";
export default session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: secure },
    store: MongoStore.create({
        mongoUrl: dbUri,
        dbName: dbName
    })
})