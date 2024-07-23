import { errorHelper, getText } from "../../../utils/index.js";
import { User } from "../../../models/index.js";
import { makeAuthRequest } from "../../../utils/helpers/renweb/authorization.js";
import { schoolStudentInfo } from "../../../utils/helpers/renweb/requests/general.js";

export default async (req, res) => {
  try {

    const token = req.header('Authorization')?.split(' ')[1];
    const user = await User.findOne({ apiToken: token }).exec();

    const ssInfo = await schoolStudentInfo(user._id);

    const year = req.query.yearId ?? ssInfo.defaultYearId;
    const term = req.query.termId ?? ssInfo.defaultTermId;

    const classes = await makeAuthRequest(user._id,
        `https://nbsmobileapi.renweb.com/api/StudentClasses/${ssInfo.defaultSchoolCode}/${year}/${term}/${ssInfo.defaultStudentId}`
    );

    return res.status(200).json({
      resultMessage: getText(null, "api.facts.classes.success"),
      resultCode: "api.facts.classes.success",
      data: classes
    });
  } catch (error) {
    return res.status(500).json(errorHelper('api.updater.unknownError', req, error.message))
  }
};

/**
 * @swagger
 * /facts/classes:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - General
 *
 *     summary: Get all classes from FACTS api
 *
 *     parameters:
 *       - name: yearId
 *         description: The year id (optional)
 *         in: query
 *         type: integer
 *       - name: termId
 *         description: The term id (optional)
 *         in: query
 *         type: integer
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
 */