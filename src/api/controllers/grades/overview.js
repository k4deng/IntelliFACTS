import { client } from '../../../config/index.js';
import { User } from "../../../models/index.js";
import { getAllClassGradesInfo } from "../../../utils/helpers/renweb/requests/grades.js";
import { schoolStudentInfo } from "../../../utils/helpers/renweb/requests/general.js";

export default async (req, res) => {

  const data = await getAllClassGradesInfo(req.session.user, req.query.term);
  const ssInfo = await schoolStudentInfo(req.session.user)

  return res.render('grades/overview.ejs', {
    site: client,
    user: req.session.user ? await User.findOne({ _id: req.session.user }) : null,
    data: JSON.stringify(data),
    terms: ssInfo.studentSchools[0].pwTerms,
    termQuery: req.query.term ?? ssInfo.studentSchools[0].pwDefaultTermId,
  });
};