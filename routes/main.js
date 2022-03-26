/**
 * Created by ASTAKHOV A.A. on 26.03.2022
 */

const express = require('express');

const { Router } = express;

const router = Router();

const UserController = require('../controllers/user-controller');

router.post('/:id/reset-password', UserController.resetPassword);
router.post('/:id/new-password', UserController.newPassword);

module.exports = router;
