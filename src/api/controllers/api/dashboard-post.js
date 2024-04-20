import { User } from "../../../models/index.js";
import { v4 as uuidv4 } from 'uuid'

export default async (req, res) => {
    const newToken = uuidv4();
    await User.findOneAndUpdate({ _id: req.session.user }, { apiToken: newToken }).exec();
    return res.redirect('/api/dashboard');
};