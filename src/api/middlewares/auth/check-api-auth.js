import { User } from '../../../models/index.js';
import { errorHelper } from '../../../utils/index.js';

export default async (req, res, next) => {
    //allow for user session to also work (for in browser requests)
    if (req.session.user) {
        try {
            const exists = await User.exists({ _id: req.session.user })
                .catch((err) => {
                    return res.status(500).json(errorHelper('checkApiAuth.userSearchError', req, err.message));
                });

            if (!exists) return res.status(400).json(errorHelper('checkApiAuth.userNotFound', req));

            return next();
        } catch (err) {
            return res.status(401).json(errorHelper('checkApiAuth.invalidToken', req, err.message));
        }
    }

    //authentication header
    const authHeader = req.header('Authorization');
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json(errorHelper('checkApiAuth.noToken', req));

        try {
            const exists = await User.exists({ apiToken: token })
                .catch((err) => {
                    return res.status(500).json(errorHelper('checkApiAuth.userApiTokenSearchError', req, err.message));
                });

            if (!exists) return res.status(400).json(errorHelper('checkApiAuth.userApiTokenNotFound', req));

           return next();
        } catch (err) {
            return res.status(401).json(errorHelper('checkApiAuth.invalidApiToken', req, err.message));
        }
    }

    // there was no creds
    return res.status(401).json(errorHelper('checkApiAuth.noCreds', req));

};
