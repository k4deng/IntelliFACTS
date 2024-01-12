import express, { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import { docsPrefix, swaggerConfig } from '../../config/index.js';
import home from './home.js';
import auth from './auth.js';
import user from './user.js';
import grades from './grades.js';
import homework from './homework.js';
import admin from "./admin.js";
const router = Router();

// Serve docs
const specDoc = swaggerJsdoc(swaggerConfig);
router.use(docsPrefix, serve);
router.get(docsPrefix, setup(specDoc, { explorer: true }));

// Static files
router.use('/public', express.static('src/public'));

// Rest of routes
router.use('/', home);
router.use('/auth', auth);
router.use('/user', user);
router.use('/grades', grades);
router.use('/homework', homework);
router.use('/admin', admin)

export default router;