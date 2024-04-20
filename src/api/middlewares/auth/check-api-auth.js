import { User } from '../../../models/index.js';
import { errorHelper } from '../../../utils/index.js';

export default async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
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

    // there was no creds
    return res.status(401).json(errorHelper('checkApiAuth.noCreds', req));
};

/**
 * @swagger
 * components:
 *  securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: UUID
 *
 * responses:
 *  401:
 *    description: Invalid token
 *    content:
 *      application/json:
 *        schema:
 *          $ref: '#/components/schemas/Result'
 *  500:
 *    description: An internal server error occurred, please try again
 *    content:
 *      application/json:
 *        schema:
 *          $ref: '#/components/schemas/Result'
 */