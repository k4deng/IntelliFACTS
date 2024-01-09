import { User } from '../../../models/index.js';
import { errorHelper } from '../../../utils/index.js';

export async function checkAdmin(req, res, next) {
  const user = await User.findById(req.user._id).select('type')
    .catch(err => {
      return res.status(500).json(errorHelper('middlewares.auth.userAdminSearchError', req, err.message));
    });

  if (user.type !== 'admin') return res.status(403).json(errorHelper('middlewares.auth.noAdminAccess', req));

  next();
}
export async function checkCreator(req, res, next) {
  const user = await User.findById(req.user._id).select('type')
    .catch(err => {
      return res.status(500).json(errorHelper('middlewares.auth.userCreatorSearchError', req, err.message));
    });

  if (user.type !== 'creator' && user.type !== 'admin')
    return res.status(403).json(errorHelper('middlewares.auth.noCreatorAccess', req));

  next();
}
export async function checkReader(req, res, next) {
  const user = await User.findById(req.user._id).select('type')
    .catch(err => {
      return res.status(500).json(errorHelper('middlewares.auth.userReaderSearchError', req, err.message));
    });

  if (user.type === 'user') return res.status(403).json(errorHelper('middlewares.auth.noReaderAccess', req));

  next();
}
