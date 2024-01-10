import { Router } from 'express';
import { homework } from '../controllers/homework/index.js';
import checkAuth from "../middlewares/auth/check-auth.js";

const router = Router();

// Homework Grid
router.get('/', checkAuth, homework);

export default router