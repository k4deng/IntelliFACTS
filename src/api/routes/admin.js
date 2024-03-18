import { Router } from 'express';
import { dashboard, database } from '../controllers/admin/index.js';
import checkAuth from "../middlewares/auth/check-auth.js";
import { checkAdmin } from "../middlewares/index.js";

const router = Router();

// Dashboard
router.get('/', checkAuth, checkAdmin, dashboard)

// Database Datatables
router.get('/database', checkAuth, checkAdmin, database);

export default router