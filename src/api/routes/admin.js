import { Router } from 'express';
import { database } from '../controllers/admin/index.js';
import checkAuth from "../middlewares/auth/check-auth.js";
import { checkAdmin } from "../middlewares/index.js";

const router = Router();

// Database Datatables
router.get('/database', checkAuth, checkAdmin, database);

export default router