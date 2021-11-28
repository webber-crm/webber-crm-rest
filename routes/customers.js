const { Router } = require('express'); // аналог const express.Router = require('express')
const { validationResult } = require('express-validator');

const { isValidObjectId } = require('mongoose');
const Customer = require('../models/customers');

const router = Router();
const auth = require('../middleware/auth');

const { customersValidators } = require('../utils/validators');

router.get('/', auth, async (req, res) => {
    const customers = await Customer.find();
    res.json(customers);
});

router.post('/', auth, customersValidators, async (req, res) => {
    const { body } = req;

    const errors = validationResult(req); // получаем ошибки валдации (если есть)

    // если переменная с ошибками не пуста
    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: errors.array()[0].msg });
    }

    try {
        const customer = new Customer(body);
        const current = await customer.save(); // вызываем метод класса Task для сохранения в БД

        res.json(current);
    } catch (e) {
        throw Error(e);
    }
});

router.get('/:id', auth, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
        return res.status(404).json({ msg: 'Клиент не найден' });
    }

    res.json(customer);
});

router.patch('/:id', auth, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    const { body } = req;

    const errors = validationResult(req); // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const current = await Customer.findByIdAndUpdate(id, body, { new: true });
    res.json(current);
});

router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    await Customer.findByIdAndDelete(id);
    res.status(204).json({});
});

module.exports = router;
