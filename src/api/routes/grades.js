import { Router } from 'express';
import { overview, classGradesPage } from '../controllers/grades/index.js';
import checkAuth from "../middlewares/auth/check-auth.js";

const router = Router();

// Overview
router.get('/overview', checkAuth, overview);
router.get('/class/:id', checkAuth, classGradesPage);

export default router