import express, { Router } from 'express';
import home from './home.js';
import auth from './auth.js';
import settings from './settings.js';
import grades from './grades.js';
import homework from './homework.js';
import admin from "./admin.js";
import api from "./api.js";
import notifications from "./notifications.js";
const router = Router();

// Static files
router.use('/public', express.static('src/public'));
router.use('/', express.static('src/public/js/serviceworker'));

// Rest of routes
router.use('/', home);
router.use('/auth', auth);
router.use('/settings', settings);
router.use('/grades', grades);
router.use('/homework', homework);
router.use('/admin', admin);
router.use('/api', api);
router.use('/notifications', notifications);

export default router;