import { client, vapidPublicKey } from "../../../config/index.js";
import { User } from "../../../models/index.js";

export default async (req, res) => {
    return res.render('notifications/dashboard.ejs', {
        site: client,
        user: req.session.user ? await User.findOne({ _id: req.session.user }).exec() : null,
        vapidKey: vapidPublicKey
    });
};