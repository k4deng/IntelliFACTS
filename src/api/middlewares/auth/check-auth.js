import { User } from '../../../models/index.js';
import { errorHelper } from '../../../utils/index.js';

export default async (req, res, next) => {
  if (!req.session.user) {
    errorHelper('checkAuth.noSession', req)
    return res.redirect(`/auth/login?redirect=${req.originalUrl}`);
  }

  try {
    const exists = await User.exists({ _id: req.session.user })
      .catch((err) => {
        return res.status(500).json(errorHelper('checkAuth.userSearchError', req, err.message));
      });

    if (!exists) return res.status(400).json(errorHelper('checkAuth.userNotFound', req));

    next();
  } catch (err) {
    return res.status(401).json(errorHelper('checkAuth.invalidToken', req, err.message));
  }
};
