import { client } from '../../../config/index.js';
import { Setting, User } from "../../../models/index.js";

export default async (req, res) => {
    return res.render('settings/updater.ejs', {
        site: client,
        user: req.session.user ? await User.findOne({ _id: req.session.user }) : null,
        settings: (await Setting.findOne({ userId: req.session.user })).updater,
        enums: {
            info: await Setting.schema.path('updater.checkedElements.info').options.enum,
            data: await Setting.schema.path('updater.checkedElements.data').options.enum
        }
    });
};