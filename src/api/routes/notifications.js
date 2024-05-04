import { Router } from 'express';
import { register, dashboard, view } from '../controllers/notifications/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

// register push subscription
router.post('/register', auth, register)
//router.post('/update', auth, update)

router.get('/dashboard', auth, dashboard)
router.get('/view', auth, view)

export default router