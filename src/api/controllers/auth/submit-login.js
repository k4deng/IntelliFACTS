import { Setting, UpdaterData, User } from '../../../models/index.js';
import { validateLogin } from '../../validators/user.validator.js';
import { errorHelper, getText, logger, sendWebPushNotification } from '../../../utils/index.js';
import { loginUser } from '../../../utils/index.js';
import { schoolStudentInfo } from "../../../utils/helpers/renweb/requests/general.js";
import { EmbedBuilder } from "discord.js";
import { client } from "../../../config/index.js";
import { bot } from "../../../loaders/bot.js";

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

  // make sure user is a student, not a parent
  if (loginRes.user.role !== 'student') return res.status(400).render("auth/login.ejs", { message: "You must login with a student account", data: req.body })

  // if the user logged in after needing to login, send notif
  if (user && user.needsLogin) {
    const userSettings = await Setting.findOne({ userId: user._id }).exec();

    // if there is a channel setup for notifs, send a message
    const channelId = userSettings.updater.discordNotifications[0]?.channelId;
    if (channelId) {
      const message = new EmbedBuilder()
        .setTitle("Logged back in!")
        .setDescription(`Your RenWeb login has been refreshed. You will now continue to receive notifications from ${client.name}.`)
        .setColor(3066993)
      await bot.channels.cache.get(channelId).send({ embeds: [message] });
    }

    // send push if there are any subscriptions
    for (const { endpoint, keys } of userSettings.updater.pushSubscriptions) {
      await sendWebPushNotification(endpoint, keys, {
        title: "Logged back in!",
        body: `Your RenWeb login has been refreshed. You will now continue to receive notifications from ${client.name}.`,
        data: { url: client.url }
      });
    }
  }

  const userData = {
    personId: loginRes.user.personId,
    userName: loginRes.user.userName,
    firstName: loginRes.user.firstName,
    lastName: loginRes.user.lastName,
    role: loginRes.user.role,
    tokens: loginRes.tokens,
    needsLogin: false,
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

  // get and update user pfp
  const { studentSchools: { 0: { students: { 0: { pictureUrl }}}} } = await schoolStudentInfo(user._id).catch();
  await User.findOneAndUpdate({ personId: loginRes.user.personId }, { photoUrl: pictureUrl })
    .catch((err) => {
      return res.status(500).json(errorHelper('submitLogin.userUpdatePhotoUrlError', req, err.message));
    });

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