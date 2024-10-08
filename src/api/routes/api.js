import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import { swaggerConfig } from '../../config/index.js';
import { dashboard, dashboardPost, factsClasses, updater } from '../controllers/api/index.js';
import { checkApiAdmin, checkApiAuth, checkAuth } from "../middlewares/index.js";

const router = Router();

// Docs
const specDoc = swaggerJsdoc(swaggerConfig);
router.use('/docs', serve);
router.get('/docs', setup(specDoc, { explorer: true }));

// Dashboard to get tokens and whatnot
router.get('/dashboard', checkAuth, dashboard);
router.post('/dashboard', checkAuth, dashboardPost);

// Actual api routes
router.get('/updater', checkApiAuth, checkApiAdmin, updater); //admin only
//router.get('/logs', checkApiAuth, checkApiAdmin, test); //admin only
//router.get('/notifications', checkApiAuth, checkApiAdmin, test); //admin only
//router.get('/users', checkApiAuth, checkApiAdmin, test); //admin only
//router.get('/me', checkApiAuth, test);
router.get('/facts/classes', checkApiAuth, factsClasses);
//router.get('/facts/homework', checkApiAuth, test);

router.all('*', (req, res) => {
    res.status(404).json({ error: `Invalid Request: Cannot ${req.method} /api${req.path}` });
});

export default router