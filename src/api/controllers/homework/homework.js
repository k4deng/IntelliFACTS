import { client } from '../../../config/index.js';
import { User } from "../../../models/index.js";
import { getHomeworkGrid } from "../../../utils/helpers/renweb/requests/homework.js";

export default async (req, res) => {

    return res.render('homework/homework.ejs', {
        site: client,
        user: req.session.user ? await User.findOne({ _id: req.session.user }).exec() : null,
        data: await getHomeworkGrid(req.session.user, req.query?.term)
    });
};