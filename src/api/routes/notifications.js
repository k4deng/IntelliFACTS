import { Router } from 'express';
import { register, dashboard, get } from '../controllers/notifications/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

// register push subscription
router.post('/register', auth, register)
//router.post('/update', auth, update)

router.get('/', auth, dashboard)
router.get('/get', auth, get)

export default router