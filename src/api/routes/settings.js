import { Router } from 'express';
import { userSettings, setUserSettings, updaterSettings, setUpdaterSettings } from '../controllers/settings/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

router.get('/user', auth, userSettings);
router.post('/user', auth, setUserSettings);

router.get('/updater', auth, updaterSettings);
router.post('/updater', auth, setUpdaterSettings);

export default router