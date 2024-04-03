export default async (req, res) => {
  return res.json({
    status: "ok"
  })
};

/**
 * @swagger
 * /test:
 *   get:
 *     tags:
 *       - Test
 *     description: Test endpoint
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 */