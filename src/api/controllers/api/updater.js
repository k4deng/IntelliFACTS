import { errorHelper, getText } from "../../../utils/index.js";
import { runUpdater } from "../../../updater/index.js";
import { User } from "../../../models/index.js";

export default async (req, res) => {
  try {

    let users;
    if (req.query.userId) {
      const user = await User.findOne({ _id: req.query.userId }).exec();
      if (!user) return res.status(404).json(errorHelper('api.updater.userNotFound', req));
      users = [user._id];
    } else {
      users = await User.find({}).exec();
      users = users.map(user => user._id);
    }

    for (const user of users) {
        await runUpdater(user);
    }

    return res.status(200).json({
      resultMessage: getText(null,"api.updater.success"),
      resultCode: "api.updater.success"
    });
  } catch (error) {
    return res.status(500).json(errorHelper('api.updater.unknownError', req, error.message))
  }
};

/**
 * @swagger
 * /updater:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Admin Only
 *
 *     summary: Run the updater for a specific user or all users
 *
 *     parameters:
 *       - name: userId
 *         description: The user's id (optional)
 *         in: query
 *         type: string
 *
 *     responses:
 *       401:
 *         $ref: '#/responses/401'
 *       500:
 *         $ref: '#/responses/500'
 *
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Result'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Result'
 */