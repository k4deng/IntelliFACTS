import { Router } from 'express';
import { settings, setUserSettings, setUpdaterSettings } from '../controllers/settings/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

router.get('/', auth, settings);

router.post('/user', auth, setUserSettings);
router.post('/updater', auth, setUpdaterSettings);

export default router