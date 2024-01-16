import { errorHelper } from "../../../utils/index.js";
import { validateUserSettings } from "../../validators/settings.validator.js";
import { Setting } from "../../../models/index.js";

export default async (req, res) => {

    const { error } = await validateUserSettings(req.body.data);
    if (error) {
        let code = 'submitUserSettings.provideAllFields';

        if (error.details[0].message.includes('classes.filteringType'))
            code = 'submitUserSettings.invalidFilteringType';
        if (error.details[0].message.includes('classes.list'))
            code = 'submitUserSettings.invalidClassesList';

        return res.json({
            status: "error",
            message: errorHelper(code, req, error.details[0].message).resultMessage.en
        })
    }

    await Setting.findOneAndUpdate({ userId: req.session.user }, { user: req.body.data })
        .catch((err) => {
            return res.json({
                status: "error",
                message: errorHelper('submitUserSettings.userUpdateSettingsError', req, err.message).resultMessage.en
            })
        });

    return res.json({
        status: "success",
        message: "User settings saved successfully!"
    })
};