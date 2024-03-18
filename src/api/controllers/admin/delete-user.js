import { errorHelper } from "../../../utils/index.js";
import { User, Setting, UpdaterData } from "../../../models/index.js";

export default async (req, res) => {

    await User.findOneAndDelete({ _id: req.body.data.userId })
        .catch((err) => {
            return res.json({
                status: "error",
                message: errorHelper('deleteUser.deleteUserError', req, err.message).resultMessage.en
            })
        });

    await Setting.findOneAndDelete({ userId: req.body.data.userId })
        .catch((err) => {
            return res.json({
                status: "error",
                message: errorHelper('deleteUser.deleteSettingError', req, err.message).resultMessage.en
            })
        });

    await UpdaterData.findOneAndDelete({ userId: req.body.data.userId })
        .catch((err) => {
            return res.json({
                status: "error",
                message: errorHelper('deleteUser.deleteUpdaterDataError', req, err.message).resultMessage.en
            })
        });

    return res.json({
        status: "success",
        message: `User "${req.body.data.userName}" deleted successfully!`
    })
};