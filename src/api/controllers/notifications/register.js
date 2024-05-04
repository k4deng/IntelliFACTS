import { Setting } from "../../../models/index.js";
import { errorHelper } from "../../../utils/index.js";

export default async (req, res) => {
    await Setting.findOneAndUpdate({ userId: req.session.user },
        { $push: {
            'updater.pushSubscriptions': { ...req.body, sentElements: [] }
        }}
    ).catch((err) => {
        return res.json({
            status: "error",
            message: errorHelper('notifications.register.userUpdateSettingsError', req, err.message).resultMessage.en
        })
    });

    return res.json({
        status: "success",
        message: "Saved subscription successfully!"
    })
};