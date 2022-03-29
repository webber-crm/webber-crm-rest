const { Router } = require('express'); // аналог const express.Router = require('express')

const router = Router();
const { usersValidators } = require('../utils/validators');
const UserController = require('../controllers/user-controller');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, UserController.getUsers);
router.post('/', authMiddleware, UserController.create);

router.get('/:id', authMiddleware, UserController.getUser);
router.patch('/:id', authMiddleware, usersValidators, UserController.edit);
router.patch('/:id/change-password', authMiddleware, UserController.changePassword);
router.delete('/:id', authMiddleware, UserController.delete);

module.exports = router;
