import { client } from '../../../config/index.js';
import { User } from "../../../models/index.js";
import mongoose from "mongoose";


export default async (req, res) => {
    return res.render('admin/database.ejs', {
        site: client,
        user: req.session.user ? await User.findOne({ _id: req.session.user }).exec() : null,
        data: JSON.stringify({
            users: await mongoose.connection.collection('users').find({}).toArray(),
            sessions: await mongoose.connection.collection('sessions').find({}).toArray(),
            rateLimits: await mongoose.connection.collection('rateLimits').find({}).toArray()
        })
    });
};