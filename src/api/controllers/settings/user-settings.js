import { client } from '../../../config/index.js';
import { Setting, User } from "../../../models/index.js";

export default async (req, res) => {
    return res.render('settings/user.ejs', {
        site: client,
        user: req.session.user ? await User.findOne({ _id: req.session.user }) : null,
        settings: await Setting.findOne({ userId: req.session.user })
    });
};