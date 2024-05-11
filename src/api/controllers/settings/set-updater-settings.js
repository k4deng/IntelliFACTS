import { errorHelper } from "../../../utils/index.js";
import { validateUpdaterSettings } from "../../validators/settings.validator.js";
import { Setting } from "../../../models/index.js";

export default async (req, res) => {

    const { error } = await validateUpdaterSettings(req.body.data);
    if (error) {
        let code = 'submitUpdaterSettings.provideAllFields';

        if (error.details[0].message.includes('enabled'))
            code = 'submitUpdaterSettings.invalidEnabled';
        if (error.details[0].message.includes('notifications.sentElements'))
            code = 'submitUpdaterSettings.invalidNotificationSentElements';
        if (error.details[0].message.includes('notifications.style'))
            code = 'submitUpdaterSettings.invalidNotificationStyle';

        return res.json({
            status: "error",
            message: errorHelper(code, req, error.details[0].message).resultMessage.en
        })
    }

    await Setting.findOneAndUpdate(
        { userId: req.session.user },
        { $set: {
            "updater.enabled": req.body.data.enabled
        }})
        .catch((err) => {
            return res.json({
                status: "error",
                message: errorHelper('submitUpdaterSettings.userUpdateSettingsError', req, err.message).resultMessage.en
            })
        });

    for (const notification of req.body.data.notifications) {
        await Setting.findOneAndUpdate(
            { userId: req.session.user },
            { $set: {
                "updater.discordNotifications.$[elem].sentElements": notification.sentElements,
                "updater.discordNotifications.$[elem].style": notification.style
            }},
            { arrayFilters: [{ "elem.channelId": notification.channelId }]}
        )
        .catch((err) => {
            return res.json({
                status: "error",
                message: errorHelper('submitUpdaterSettings.notificationUpdateSettingsError', req, err.message).resultMessage.en
            })
        });
    }

    return res.json({
        status: "success",
        message: "Updater settings saved successfully!"
    })
};