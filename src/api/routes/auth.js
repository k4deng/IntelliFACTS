import { Router } from 'express';
import { login, submitLogin, logout } from '../controllers/auth/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

router.get('/login', login);
router.post('/login', submitLogin);
router.get('/logout', auth, logout);

export default router