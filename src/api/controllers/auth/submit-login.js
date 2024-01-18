import { Setting, UpdaterData, User } from '../../../models/index.js';
import { validateLogin } from '../../validators/user.validator.js';
import { errorHelper, getText, logger } from '../../../utils/index.js';
import { loginUser } from '../../../utils/index.js';

export default async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    let code = 'submitLogin.provideAllFields';

    if (error.details[0].message.includes('District'))
      code = 'submitLogin.invalidDistrict';
    else if (error.details[0].message.includes('Username'))
      code = 'submitLogin.invalidUsername';
    else if (error.details[0].message.includes('Password'))
      code = 'submitLogin.invalidPassword';

    return res.status(400).render("auth/login.ejs", { message: errorHelper(code, req, error.details[0].message).resultMessage.en, data: req.body });
  }

  // validation passed, try to log in the user
  const loginRes = await loginUser(req.body.District, req.body.Username, req.body.Password)

  // user login was not successful
  if (loginRes.type === "error") {
    errorHelper("submitLogin.loginUnsuccessful", req, loginRes.message);
    return res.status(400).render("auth/login.ejs", { message: loginRes.message, data: req.body })
  }

  // check for existing user
  let user = await User.findOne({ personId: loginRes.user.personId }).exec()
    .catch((err) => {
      return res.status(500).json(errorHelper('submitLogin.userSearchError', req, err.message));
    });

  const userData = {
    personId: loginRes.user.personId,
    userName: loginRes.user.userName,
    firstName: loginRes.user.firstName,
    lastName: loginRes.user.lastName,
    role: loginRes.user.role,
    tokens: loginRes.tokens
  }

  // exists, update user from login
  if (user) {
    await User.findOneAndUpdate({ personId: loginRes.user.personId }, userData)
      .catch((err) => {
        return res.status(500).json(errorHelper('submitLogin.userUpdateTokensError', req, err.message));
      });
  }

  // first time login, register user
  if (!user) {
    // make user
    user = new User(userData);
    user = await user.save().catch((err) => {
      return res.status(500).json(errorHelper('submitLogin.userCreateError', req, err.message));
    });

    // make settings
    const settings = new Setting({ userId: user._id });
    await settings.save().catch((err) => {
      return res.status(500).json(errorHelper('submitLogin.settingsCreateError', req, err.message));
    });

    // make updater data
    const updaterData = new UpdaterData({ userId: user._id });
    await updaterData.save().catch((err) => {
      return res.status(500).json(errorHelper('submitLogin.updaterDataCreateError', req, err.message));
    });
  }

  // add the user id to the session, they are logged in
  req.session.regenerate((err) => {
    if (err) return res.status(500).json(errorHelper('submitLogin.sessionCreateError', req, err.message));

    req.session.user = user._id;
    req.session.save((err) => {
      if (err) return res.status(500).json(errorHelper('submitLogin.sessionSaveError', req, err.message));
      logger('submitLogin.successfulLogin', user._id, getText('en', 'submitLogin.successfulLogin'), 'Info', req);

      return res.status(200).redirect(req.query.redirect ?? '/')
    });
  });

};