import { User } from '../../../models/index.js';
import { validateLogin } from '../../validators/user.validator.js';
import { errorHelper, getText, logger } from '../../../utils/index.js';
import bcrypt from 'bcryptjs';
const { compare } = bcrypt;
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

    return res.status(400).render("login.ejs", { message: errorHelper(code, req, error.details[0].message).resultMessage.en, data: req.body });
  }

  // validation passed, try to log in the user
  const loginRes = await loginUser(req.body.District, req.body.Username, req.body.Password)

  // user login was not successful
  if (loginRes.type === "error") {
    errorHelper("submitLogin.loginUnsuccessful", req, loginRes.message);
    return res.status(400).render("login.ejs", { message: loginRes.message, data: req.body })
  }

  // check for existing user
  let user = await User.findOne({ personId: loginRes.user.personId })
    .catch((err) => {
      return res.status(500).json(errorHelper('submitLogin.userSearchError', req, err.message));
    });

  const mongooseUpdatedUser = {
    personId: loginRes.user.personId,
    userName: loginRes.user.userName,
    firstName: loginRes.user.firstName,
    lastName: loginRes.user.lastName,
    role: loginRes.user.role,
    tokens: loginRes.tokens
  }

  // exists, update user from login
  if (user) {
    await User.findOneAndUpdate({ personId: loginRes.user.personId }, mongooseUpdatedUser)
      .catch((err) => {
        return res.status(500).json(errorHelper('submitLogin.userUpdateTokensError', req, err.message));
      });
  }

  // first time login, register user
  if (!user) {
    user = new User(mongooseUpdatedUser);

    user = await user.save().catch((err) => {
      return res.status(500).json(errorHelper('submitLogin.userRegisterError', req, err.message));
    });
  }

  // add the user id to the session, they are logged in
  req.session.regenerate((err) => {
    if (err) return res.status(500).json(errorHelper('submitLogin.sessionCreateError', req, err.message));

    req.session.user = user._id;
    req.session.save((err) => {
      logger('submitLogin.successfulLogin', user._id, getText('en', 'submitLogin.successfulLogin'), 'Info', req);

      return res.status(200).json({
        resultMessage: { en: getText('en', 'submitLogin.successfulLogin') },
        resultCode: 'submitLogin.successfulLogin',
        user
      });
    });
  });

};