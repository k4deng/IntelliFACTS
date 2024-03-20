import { client } from '../../../config/index.js';
import { Setting, User } from "../../../models/index.js";
import moment from "moment";
import { getAllClassGradesInfo } from "../../../utils/helpers/renweb/requests/grades.js";
import { bot } from '../../../loaders/bot.js';

export default async (req, res) => {

    let classes = {};
    const info = await getAllClassGradesInfo(req.session.user, null, true);
    for (const [classId, classObj] of Object.entries(info)) {
        classes[classId] = classObj.class.title;
    }

    const user = req.session.user ? await User.findOne({ _id: req.session.user }).exec() : null;

    return res.render('settings/settings.ejs', {
        site: client,
        user: user,
        settings: await Setting.findOne({ userId: req.session.user }).exec(),
        classes: classes,
        enums: {
            checkedElements: {
                info: await Setting.schema.path('updater.checkedElements.info').options.enum,
                data: await Setting.schema.path('updater.checkedElements.data').options.enum
            },
            filteringType: await Setting.schema.path('user.classes.filteringType').options.enum
        },
        moment: moment,
        discordUsername: user !== null ? bot.users.cache.get(user.discordId)?.displayName || null : null,
        bot: bot
    });
};