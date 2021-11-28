const bcrypt = require('bcryptjs');
const { Router } = require('express'); // аналог const express.Router = require('express')
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer'); // подключаем общий пакет для отправки email
const sendgrid = require('nodemailer-sendgrid-transport'); // пакет email для сервиса sendgrid
const { isValidObjectId } = require('mongoose');

const keys = require('../config');
const deleteEmail = require('../emails/delete');

const router = Router();
const registerEmail = require('../emails/registration');
const auth = require('../middleware/auth');
const User = require('../models/users');
const { usersValidators } = require('../utils/validators');

/*
    создаём transporter для sendgrid

    в метод createTransport передаём функцию из пакета "nodemailer-sendgrid-transport"
    внутри функции sendrid передаём объект конфигурации
 */
const transporter = nodemailer.createTransport(
    sendgrid({
        auth: {
            api_key: keys.SENDGRID_API_KEY, // передаём ключ API, полученный в Sendgrid
        },
    }),
);

router.get('/', auth, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.post('/', async (req, res) => {
    try {
        const { password, ...body } = req.body;
        const { name, email } = body;

        const errors = validationResult(req); // получаем ошибки валдации (если есть)
        if (!errors.isEmpty()) {
            // если переменная с ошибками не пуста
            return res.status(400).json({ msg: errors.array()[0].msg });
        }

        /*
            создаём хэш пароля
         */
        const hashPassword = await bcrypt.hash(password, 10);

        const user = new User({ ...body, password: hashPassword });

        const current = await user.save();
        res.json(current);

        /*
            отправляем письмо через метод sendMail() у transporter
            отправку письма рекомендуется делать после редиректов, чтобы не наблюдать задержек
         */
        await transporter.sendMail(registerEmail(email, name.first));
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id', auth, async (req, res) => {
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

router.patch('/:id', auth, usersValidators, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    const errors = validationResult(req); // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) {
        // если переменная с ошибками не пуста
        return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { body } = req;

    const current = await User.findByIdAndUpdate(id, body, { new: true });
    res.json(current);
});

router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Неправильный формат id' });
    }

    const { email, username } = await User.findById(id);
    const { user } = req.session;

    if (user.email === email || user.username === username) {
        res.status(400).json({ msg: 'Невозможно удалить текущего пользователя' });
    }

    await User.findByIdAndDelete(id);
    res.status(204).json({});

    /*
        отправляем письмо через метод sendMail() у transporter
        отправку письма рекомендуется делать после редиректов, чтобы не наблюдать задержек
     */
    await transporter.sendMail(deleteEmail(email));
});

module.exports = router;
