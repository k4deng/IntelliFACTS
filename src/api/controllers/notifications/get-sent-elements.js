import { errorHelper } from "../../../utils/index.js";
import { Setting } from "../../../models/index.js";

export default async (req, res) => {

    try {
        const setting = await Setting.findOne({
            userId: req.session.user,
            'updater.pushSubscriptions.endpoint': req.body.endpoint
        }, {
            'updater.pushSubscriptions.$': 1
        }).exec();

        return res.json({
            status: "success",
            data: setting.updater.pushSubscriptions[0].sentElements
        })
    } catch (error) {
        return res.json({
            status: "error",
            message: errorHelper('getNotificationsSentElements.genericError', req, error.message).resultMessage.en
        })
    }

};