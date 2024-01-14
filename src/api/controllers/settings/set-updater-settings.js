import { errorHelper } from "../../../utils/index.js";
import { validateUpdaterSettings } from "../../validators/settings.validator.js";
import { Setting } from "../../../models/index.js";

export default async (req, res) => {

    const { error } = await validateUpdaterSettings(req.body.data);
    if (error) {
        let code = 'submitUpdaterSettings.provideAllFields';

        if (error.details[0].message.includes('checkedElements.info'))
            code = 'submitUpdaterSettings.invalidInfoCheckedElements';
        if (error.details[0].message.includes('checkedElements.data'))
            code = 'submitUpdaterSettings.invalidDataCheckedElements';

        return res.json({
            status: "error",
            message: errorHelper(code, req, error.details[0].message).resultMessage.en
        })
    }

    await Setting.findOneAndUpdate({ userId: req.body.userId }, { updater: req.body.data })
        .catch((err) => {
            return res.json({
                status: "error",
                message: errorHelper('submitUpdaterSettings.userUpdateSettingsError', req, err.message).resultMessage.en
            })
        });

    return res.json({
        status: "success",
        message: "Settings saved successfully!"
    })
};