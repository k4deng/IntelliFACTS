import { errorHelper } from "../../../utils/index.js";
import { validateUpdaterSettings } from "../../validators/settings.validator.js";
import { Setting } from "../../../models/index.js";

export default async (req, res) => {

    const { error } = await validateUpdaterSettings(req.body.data);
    if (error) {
        let code = 'submitUpdaterSettings.provideAllFields';

        if (error.details[0].message.includes('enabled'))
            code = 'submitUpdaterSettings.invalidEnabled';
        if (error.details[0].message.includes('checkedElements'))
            code = 'submitUpdaterSettings.invalidCheckedElements';
        if (error.details[0].message.includes('notifications.title'))
            code = 'submitUpdaterSettings.invalidNotificationTitle';
        if (error.details[0].message.includes('.webhook" must be a valid uri'))
            code = 'submitUpdaterSettings.invalidNotificationUri';
        if (error.details[0].message.includes('notifications.sentElements'))
            code = 'submitUpdaterSettings.invalidNotificationSentElements';
        /*if (error.details[0].message.includes('checkFrequency'))
            code = 'submitUpdaterSettings.invalidDataCheckedElements';*/

        return res.json({
            status: "error",
            message: errorHelper(code, req, error.details[0].message).resultMessage.en
        })
    }

    await Setting.findOneAndUpdate(
        { userId: req.session.user },
        { $set: {
            "updater.enabled": req.body.data.enabled,
            "updater.checkedElements": req.body.data.checkedElements,
            "updater.notifications": req.body.data.notifications
        }})
        .catch((err) => {
            return res.json({
                status: "error",
                message: errorHelper('submitUpdaterSettings.userUpdateSettingsError', req, err.message).resultMessage.en
            })
        });

    return res.json({
        status: "success",
        message: "Updater settings saved successfully!"
    })
};