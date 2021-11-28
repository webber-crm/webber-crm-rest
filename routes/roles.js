const { Router } = require('express'); // аналог const express.Router = require('express')
const { validationResult } = require('express-validator');

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
        return res.status(422).json({ msg: errors.array()[0].msg });
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
    const role = await Role.findById(req.params.id);
    res.json(role);
});

router.patch('/:id', auth, restricted, rolesValidators, async (req, res) => {
    const { id } = req.params; // забираем id из объекта req.params в переменную

    const { body } = req;

    const errors = validationResult(req); // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }

    const current = await Role.findByIdAndUpdate(id, body, { new: true });
    res.json(current);
});

router.delete('/:id', auth, restricted, async (req, res) => {
    await Role.findByIdAndDelete(req.params.id);

    res.status(204).json({});
});

module.exports = router;
