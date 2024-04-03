import logger from '../logger.js';
import en from '../lang/en.js';

export default (code, req, errorMessage) => {
  //NOTE: This control routes every server error to the same lang key.
  let key = code;
  if (!en[code]) key = 'generic.internalServerError';

  let userId = '';
  if (req && req.session && req.session.user) userId = req.session.user;

  const enMessage = en[key];

  if (enMessage.includes('server error')) {
    logger(code, userId, errorMessage, 'Server Error', req);
  } else {
    logger(code, userId, errorMessage ?? enMessage, 'Client Error', req);
  }

  return {
    'resultMessage': {
      'en': enMessage
    },
    'resultCode': code
  };
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Result:
 *       type: object
 *       properties:
 *         resultMessage:
 *           type: object
 *           properties:
 *             en:
 *               type: string
 *         resultCode:
 *           type: string
 */