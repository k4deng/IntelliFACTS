import { Router } from 'express';
import { home } from '../controllers/home/index.js';

const router = Router();

// HOMEPAGE
router.get('/', home);

export default router