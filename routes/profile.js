const { Router } = require('express'); // аналог const express.Router = require('express')

const router = Router();
const UserController = require('../controllers/user-controller');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, UserController.getProfile);
router.patch('/', authMiddleware, UserController.editProfile);

module.exports = router;
