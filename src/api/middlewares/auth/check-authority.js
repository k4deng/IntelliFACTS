import { User } from '../../../models/index.js';
import { errorHelper } from '../../../utils/index.js';
import { client } from "../../../config/index.js";

function _sendError(req, res, user, num, code) {
  const error = errorHelper(code, req)
  return res.status(num).render("error.ejs", {
    site: client,
    user: user,
    errorNum: num,
    errorDesc: error.resultMessage.en,
    errorSlug: error.resultCode,
  });
}

export async function checkAdmin(req, res, next) {
  const user = await User.findById(req.session.user).exec()
    .catch(err => {
      return res.status(500).json(errorHelper('middlewares.auth.userAdminSearchError', req, err.message));
    });

  if (user.type !== 'admin') _sendError(req, res, user, 403, 'middlewares.auth.noAdminAccess');

  next();
}

//todo: add translation keys into lang file (if needed & remove unused ones)

export async function checkApiAdmin(req, res, next) {
  const token = req.header('Authorization').split(' ')[1];
  const user = await User.find({ apiToken: token }).exec()
      .catch(err => {
        return res.status(500).json(errorHelper('middlewares.auth.userApiTokenAdminSearchError', req, err.message));
      });

  if (user.type !== 'admin') return res.status(403).json(errorHelper('middlewares.auth.noApiTokenAdminAccess', req));

  next();
}