const { Router } = require('express'); // аналог const express.Router = require('express')
const { validationResult } = require('express-validator');

const { isValidObjectId } = require('mongoose');
const Role = require('../models/role');

const router = Router();
const auth = require('../middleware/auth');
const { forbidden } = require('../middleware/variables');
const ApiError = require('../exceptions/api-error');

router.get('/', auth, async (req, res) => {
    const roles = await Role.find();
    res.json(roles);
});

router.post('/', auth, async (req, res, next) => {
    try {
        const errors = validationResult(req); // получаем ошибки валдации (если есть)

        // если переменная с ошибками не пуста
        if (!errors.isEmpty()) {
            throw ApiError.BadRequest(errors.array()[0].msg);
        }

        const { body } = req;

        const candidate = await Role.find({ role: body.role });

        if (candidate) {
            throw ApiError.BadRequest('Роль уже существует');
        }

        const role = new Role(body);
        const current = await role.save(); // вызываем метод класса Task для сохранения в БД

        res.status(201).json(current);
    } catch (e) {
        next(e);
    }
});

router.get('/:id', auth, forbidden, async (req, res) => {
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

router.patch('/:id', auth, forbidden, async (req, res) => {
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

router.delete('/:id', auth, forbidden, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    await Role.findByIdAndDelete(id);

    res.status(204).json({});
});

module.exports = router;
