import { client } from '../../../config/index.js';
import { User } from "../../../models/index.js";
export default async (req, res) => {
    return res.render('admin/dashboard.ejs', {
        site: client,
        user: req.session.user ? await User.findOne({ _id: req.session.user }).exec() : null,
        stats: {
            users: await User.countDocuments().exec()
        },
        deleteUserFormUsers: await User.find({}, 'id firstName lastName').exec()
    });
};