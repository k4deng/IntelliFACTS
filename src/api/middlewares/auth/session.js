import session from 'express-session'
import MongoStore from 'connect-mongo'
import { sessionSecret, secure, dbUri } from "../../../config/index.js";
export default session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: secure },
    store: MongoStore.create({
        mongoUrl: dbUri,
        dbName: 'IntelliFACTS'
    })
})