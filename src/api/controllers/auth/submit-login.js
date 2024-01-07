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
    return res.status(400).render("login.ejs", {message: loginRes.message, data: req.body})
  }

  // else login was successful

  return res.status(200).json(loginRes)

  const user = await User.findOne({ email: req.body.email, isActivated: true, isVerified: true }).select('+password')
    .catch((err) => {
      return res.status(500).json(errorHelper('00041', req, err.message));
    });

  if (!user)
    return res.status(404).json(errorHelper('00042', req));

  const match = await compare(req.body.password, user.password);
  if (!match)
    return res.status(400).json(errorHelper('00045', req));


  logger('00047', user._id, getText('en', '00047'), 'Info', req);
  return res.status(200).json({
    resultMessage: { en: getText('en', '00047') },
    resultCode: '00047', user
  });
};

/**
 * @swagger
 * /user/login:
 *    post:
 *      summary: Login
 *      requestBody:
 *        description: Email and password information to login
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *      tags:
 *        - User
 *      responses:
 *        "200":
 *          description: You logged in successfully.
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          resultMessage:
 *                              $ref: '#/components/schemas/ResultMessage'
 *                          resultCode:
 *                              $ref: '#/components/schemas/ResultCode'
 *                          user:
 *                              $ref: '#/components/schemas/User'
 *                          accessToken:
 *                              type: string
 *                          refreshToken:
 *                              type: string
 *        "400":
 *          description: Please provide all the required fields!
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Result'
 *        "500":
 *          description: An internal server error occurred, please try again.
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Result'
 */