const { Router } = require('express'); // аналог const express.Router = require('express')

const { loginValidators, registerValidators } = require('../utils/validators');
const authMiddleware = require('../middleware/auth');

const UserController = require('../controllers/user-controller');

const router = Router();

router.post('/registration', registerValidators, UserController.registration);
router.post('/login', loginValidators, UserController.login);
router.post('/logout', UserController.logout);
router.get('/activate/:link', UserController.activate);
router.get('/refresh', UserController.refresh);

module.exports = router;
