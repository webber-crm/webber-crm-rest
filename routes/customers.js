const { Router } = require('express'); // аналог const express.Router = require('express')
const { validationResult } = require('express-validator');

const User = require('../models/users');
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
        return res.status(422).json({ msg: errors.array()[0].msg });
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
    const customer = await Customer.findById(req.params.id);
    res.json(customer);
});

router.patch('/:id', auth, async (req, res) => {
    const { id } = req.params; // забираем id из объекта req.params в переменную

    const { body } = req;

    const errors = validationResult(req); // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }

    const current = await Customer.findByIdAndUpdate(id, body, { new: true });
    res.json(current);
});

router.delete('/:id', auth, async (req, res) => {
    await Customer.findByIdAndDelete(req.params.id);

    res.status(204).json({});
});

module.exports = router;
