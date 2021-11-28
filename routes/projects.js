const { Router } = require('express'); // аналог const express.Router = require('express')
const { validationResult } = require('express-validator');

const { isValidObjectId } = require('mongoose');
const Project = require('../models/projects');

const router = Router();
const auth = require('../middleware/auth');

const { projectsValidators } = require('../utils/validators');

router.get('/', auth, async (req, res) => {
    const projects = await Project.find();
    res.json(projects);
});

router.post('/', auth, projectsValidators, async (req, res) => {
    const { body } = req;

    const errors = validationResult(req); // получаем ошибки валдации (если есть)

    // если переменная с ошибками не пуста
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }

    try {
        const role = new Project(body);

        const current = await role.save(); // вызываем метод класса Task для сохранения в БД

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

    const role = await Project.findById(id);

    if (!role) {
        return res.status(404).json({ msg: 'Проект не найден' });
    }

    res.json(role);
});

router.patch('/:id', auth, projectsValidators, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    const { body } = req;

    const errors = validationResult(req); // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }

    const current = await Project.findByIdAndUpdate(id, body, { new: true });
    res.json(current);
});

router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    await Project.findByIdAndDelete(id);

    res.status(204).json({});
});

module.exports = router;
