import { Router } from 'express';
import { deleteUser, editUser, getUser, login, logout } from '../controllers/user/index.js';
import { auth } from '../middlewares/index.js';

const router = Router();

// AUTH
router.post('/login', login);
router.post('/logout', auth, logout);

// EDIT
router.put('/', auth, editUser);

router.get('/', auth, getUser);
router.delete('/', auth, deleteUser);

export default router