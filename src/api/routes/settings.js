import { Router } from 'express';
import { settings, setSettings } from '../controllers/settings/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

router.get('/user', auth, settings);
router.post('/user', auth, setSettings);

export default router