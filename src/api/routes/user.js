import { Router } from 'express';
//import { getUser } from '../controllers/user/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

//router.get('/', auth, getUser);

export default router