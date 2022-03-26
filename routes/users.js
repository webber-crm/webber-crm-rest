const { Router } = require('express'); // аналог const express.Router = require('express')
const { isValidObjectId } = require('mongoose');

const router = Router();
const User = require('../models/user');
const { usersValidators } = require('../utils/validators');
const UserController = require('../controllers/user-controller');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, UserController.getUsers);
router.post('/', authMiddleware, UserController.create);

router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    const user = await User.findById(id);

    if (!user) {
        return res.status(404).json({ msg: 'Пользователь не найден' });
    }

    res.json(user);
});
router.patch('/:id', authMiddleware, usersValidators, UserController.edit);
router.delete('/:id', UserController.delete);

router.post('/:id/reset', UserController.reset);
router.post('/:id/new-password', UserController.newPassword);

module.exports = router;
