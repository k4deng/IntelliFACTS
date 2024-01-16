import { client } from '../../../config/index.js';
import { Setting, User } from "../../../models/index.js";
import moment from "moment";
import { getAllClassGradesInfo } from "../../../utils/helpers/renweb/requests/grades.js";

export default async (req, res) => {

    let classes = {};
    const info = await getAllClassGradesInfo(req.session.user, null, true);
    for (const [classId, classObj] of Object.entries(info)) {
        classes[classId] = classObj.class.title;
    }

    return res.render('settings/settings.ejs', {
        site: client,
        user: req.session.user ? await User.findOne({ _id: req.session.user }) : null,
        settings: await Setting.findOne({ userId: req.session.user }),
        classes: classes,
        enums: {
            checkedElements: {
                info: await Setting.schema.path('updater.checkedElements.info').options.enum,
                data: await Setting.schema.path('updater.checkedElements.data').options.enum
            },
            checkFrequency: await Setting.schema.path('updater.checkFrequency').options.enum,
            filteringType: await Setting.schema.path('user.classes.filteringType').options.enum
        },
        moment: moment
    });
};