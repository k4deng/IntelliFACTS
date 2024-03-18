import { Router } from 'express';
import { dashboard, database, deleteUser } from '../controllers/admin/index.js';
import checkAuth from "../middlewares/auth/check-auth.js";
import { checkAdmin } from "../middlewares/index.js";

const router = Router();

// Dashboard
router.get('/', checkAuth, checkAdmin, dashboard)
router.post('/delete-user', checkAuth, checkAdmin, deleteUser)

// Database Datatables
router.get('/database', checkAuth, checkAdmin, database);

export default router