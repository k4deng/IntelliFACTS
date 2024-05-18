import { client } from '../../../config/index.js';
import { Setting, User } from "../../../models/index.js";
import moment from "moment";
import { getAllClassGradesInfo } from "../../../utils/helpers/renweb/requests/grades.js";
import { bot } from '../../../loaders/bot.js';
import { sentElementsEnum, styleEnum } from "../../../models/setting.js";

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
            sentElements: [...sentElementsEnum.info, ...sentElementsEnum.data],
            filteringType: await Setting.schema.path('user.classes.filteringType').options.enum,
            style: styleEnum
        },
        moment: moment,
        discordUsername: user !== null ? bot.users.cache.get(user.discordId)?.displayName || null : null,
        bot: bot
    });
};