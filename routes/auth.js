const { Router } = require('express'); // аналог const express.Router = require('express')

const { loginValidators, registerValidators } = require('../utils/validators');

const UserController = require('../controllers/user-controller');

const router = Router();

router.post('/registration', registerValidators, UserController.registration);
router.get('/activate/:link', UserController.activate);

router.post('/login', loginValidators, UserController.login);
router.post('/logout', UserController.logout);

router.get('/refresh', UserController.refresh);

module.exports = router;
