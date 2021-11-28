const { Router } = require('express'); // аналог const express.Router = require('express')
const { validationResult } = require('express-validator');

const { isValidObjectId } = require('mongoose');
const Role = require('../models/roles');

const router = Router();
const auth = require('../middleware/auth');
const restricted = require('../middleware/restricted');

const { rolesValidators } = require('../utils/validators');

router.get('/', auth, async (req, res) => {
    const roles = await Role.find();
    res.json(roles);
});

router.post('/', auth, restricted, rolesValidators, async (req, res) => {
    const { body } = req;

    const errors = validationResult(req); // получаем ошибки валдации (если есть)

    // если переменная с ошибками не пуста
    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: errors.array()[0].msg });
    }

    try {
        const role = new Role(body);

        const current = await role.save(); // вызываем метод класса Task для сохранения в БД

        res.json(current);
    } catch (e) {
        throw Error(e);
    }
});

router.get('/:id', auth, restricted, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    const role = await Role.findById(id);

    if (!role) {
        return res.status(404).json({ msg: 'Роль не найдена' });
    }

    res.json(role);
});

router.patch('/:id', auth, restricted, rolesValidators, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    const { body } = req;

    const errors = validationResult(req); // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const current = await Role.findByIdAndUpdate(id, body, { new: true });
    res.json(current);
});

router.delete('/:id', auth, restricted, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    await Role.findByIdAndDelete(id);

    res.status(204).json({});
});

module.exports = router;
