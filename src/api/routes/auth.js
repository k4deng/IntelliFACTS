import { Router } from 'express';
import { login, submitLogin, logout, discordLogin, discordCallback } from '../controllers/auth/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

router.get('/login', login);
router.post('/login', submitLogin);
router.get('/logout', auth, logout);

//discord linking
router.get('/discord/login', discordLogin);
router.get('/discord/callback', discordCallback);

export default router