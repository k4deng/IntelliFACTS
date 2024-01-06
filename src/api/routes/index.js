import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import { docsPrefix, swaggerConfig } from '../../config/index.js';
import user from './user.js';
import home from './home.js';
const router = Router();

// Serve docs
const specDoc = swaggerJsdoc(swaggerConfig);
router.use(docsPrefix, serve);
router.get(docsPrefix, setup(specDoc, { explorer: true }));

// Rest of routes
router.use('/', home);
router.use('/user', user);

export default router;