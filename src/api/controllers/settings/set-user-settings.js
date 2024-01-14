import { client } from '../../../config/index.js';
import { User } from "../../../models/index.js";

export default async (req, res) => {
    //TODO: copy most of user saving from submit-login.js to here
    return res.json({
        status: "success",
        message: "Settings saved successfully!"
    })
};