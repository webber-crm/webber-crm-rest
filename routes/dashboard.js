/**
 * Created by ASTAKHOV A.A. on 27.03.2022
 */

const express = require('express');

const { Router } = express;

const router = Router();

const DashboardController = require('../controllers/dashboard-controller');

const authMiddleware = require('../middleware/auth');

router.get('/tasks', authMiddleware, DashboardController.getHomeTasks);

module.exports = router;
