import { errorHelper } from '../../../utils/index.js';

export default async (req, res) => {
  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged-in user
  req.session.user = null;
  req.session.save((err) => {
    if (err) return res.status(500).json(errorHelper('00049', req, err.message));

    req.session.regenerate(() => {
      // regenerate the session, which is good practice to help
      // guard against forms of session fixation
      return res.redirect('/');
    });

  });
};

/**
 * @swagger
 * /user/logout:
 *    post:
 *      summary: Logout the User
 *      parameters:
 *        - in: header
 *          name: Authorization
 *          schema:
 *            type: string
 *          description: Put access token here
 *      tags:
 *        - User
 *      responses:
 *        "200":
 *          description: Successfully logged out.
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Result'
 *        "401":
 *          description: Invalid token.
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Result'
 *        "500":
 *          description: An internal server error occurred, please try again.
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Result'
 */