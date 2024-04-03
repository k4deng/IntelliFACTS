import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import { swaggerConfig } from '../../config/index.js';
import { test } from '../controllers/api/index.js';
import checkAuth from "../middlewares/auth/check-auth.js";

const router = Router();

// Docs
const specDoc = swaggerJsdoc(swaggerConfig);
router.use('/docs', serve);
router.get('/docs', setup(specDoc, { explorer: true }));

// Test
router.get('/test', checkAuth, test);

export default router