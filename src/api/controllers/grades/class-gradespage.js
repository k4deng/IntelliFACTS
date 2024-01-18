import { client } from '../../../config/index.js';
import { User } from "../../../models/index.js";
import { getClassGradesPage } from "../../../utils/helpers/renweb/requests/grades.js";

export default async (req, res) => {

    const html = await getClassGradesPage(req.session.user, req.params.id, req.query.term);

    return res.render('grades/class-gradespage.ejs', {
        site: client,
        user: req.session.user ? await User.findOne({ _id: req.session.user }).exec() : null,
        html: html
    });
};