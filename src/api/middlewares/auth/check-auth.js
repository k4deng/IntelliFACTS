import { User } from '../../../models/index.js';
import { errorHelper } from '../../../utils/index.js';

export default async (req, res, next) => {
  if (!req.session.user) return res.status(401).json(errorHelper('checkAuth.noSession', req));

  try {
    const exists = await User.exists({ _id: req.session.user })
      .catch((err) => {
        return res.status(500).json(errorHelper('generic.internalServerError', req, err.message));
      });

    if (!exists) return res.status(400).json(errorHelper('checkAuth.userNotFound', req));

    next();
  } catch (err) {
    return res.status(401).json(errorHelper('00012', req, err.message));
  }
};
