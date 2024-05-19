import { errorHelper } from "../../../utils/index.js";
import { validatePushNotificationsSentElements, validateUpdaterSettings } from "../../validators/settings.validator.js";
import { Setting } from "../../../models/index.js";

export default async (req, res) => {

    const { error } = await validatePushNotificationsSentElements(req.body.data);
    if (error) {
        let code = 'updateNotificationsSentElements.provideAllFields';

        if (error.details[0].message.includes('sentElements'))
            code = 'updateNotificationsSentElements.invalidSentElements';

        return res.json({
            status: "error",
            message: errorHelper(code, req, error.details[0].message).resultMessage.en
        })
    }

    await Setting.findOneAndUpdate(
        { userId: req.session.user },
        { $set: {
                "updater.pushSubscriptions.$[elem].sentElements": req.body.data.sentElements
            }},
        { arrayFilters: [{ "elem.endpoint": req.body.data.endpoint }]}
    )
    .catch((err) => {
        return res.json({
            status: "error",
            message: errorHelper('updateNotificationsSentElements.notificationUpdateSettingsError', req, err.message).resultMessage.en
        })
    });

    return res.json({
        status: "success",
        message: "Updater settings saved successfully!"
    })
};