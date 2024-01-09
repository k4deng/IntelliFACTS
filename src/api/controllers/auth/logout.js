import { errorHelper, getText, logger } from '../../../utils/index.js';

export default async (req, res) => {
  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged-in user
  req.session.user = null;
  req.session.save((err) => {
    if (err) return res.status(500).json(errorHelper('logout.sessionSaveError', req, err.message));

    req.session.destroy(() => {
      logger('logout.successful', '', getText('en', 'logout.successful'), 'Info', req);
      return res.redirect('/');
    });

  });
};