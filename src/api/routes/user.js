import { Router } from 'express';
import { deleteUser, editUser, getUser } from '../controllers/user/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

// EDIT
router.put('/', auth, editUser);

router.get('/', auth, getUser);
router.delete('/', auth, deleteUser);

export default router