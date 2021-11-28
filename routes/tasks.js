const { Router } = require('express'); // аналог const express.Router = require('express')
const { validationResult } = require('express-validator');

const { isValidObjectId } = require('mongoose');
const Task = require('../models/tasks');

const router = Router();
const auth = require('../middleware/auth');
const { taskValidators, taskValidatorsEdit } = require('../utils/validators');

router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (e) {
        throw Error(e);
    }
});

router.post('/', auth, taskValidators, async (req, res) => {
    const errors = validationResult(req); // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) {
        // если переменная с ошибками не пуста
        return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { body } = req;

    try {
        const task = new Task(body);
        const current = await task.save(); // вызываем метод класса Task для сохранения в БД

        res.status(201).json(current);
    } catch (e) {
        throw Error(e);
    }
});

router.get('/:id', auth, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    const task = await Task.findById(id);

    if (!task) {
        return res.status(404).json({ msg: 'Задача не найдена' });
    }

    res.json(task);
});

router.patch('/:id', auth, taskValidatorsEdit, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    const errors = validationResult(req); // получаем ошибки валидации (если есть)
    if (!errors.isEmpty()) {
        // если переменная с ошибками не пуста
        return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { body } = req;

    try {
        const current = await Task.findByIdAndUpdate(id, body, { new: true });
        res.json(current);
    } catch (e) {
        throw Error(e);
    }
});

router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    await Task.findByIdAndRemove(id);
    res.status(204).json({});
});

module.exports = router;
