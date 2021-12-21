const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const { Router } = require('express'); // аналог const express.Router = require('express')
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer'); // подключаем общий пакет для отправки email
const sendgrid = require('nodemailer-sendgrid-transport'); // пакет email для сервиса sendgrid

const TokenService = require('../utils/token-service');

const keys = require('../config');
const passwordEmail = require('../emails/password');
const resetEmail = require('../emails/reset');
const User = require('../models/users');
const { loginValidators } = require('../utils/validators');
const auth = require('../middleware/auth');
const UserDTO = require('../dto/user');

const router = Router();

async function authorize(user) {
    const userDTO = new UserDTO(user);
    const tokens = TokenService.generateTokens({ ...userDTO }); // генерируем токены
    await TokenService.saveTokens(userDTO.id, tokens.refreshToken); // записываем токен пользователю

    const response = {
        ...userDTO,
        ...tokens,
    };

    return [userDTO, response];
}

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

router.post('/login', loginValidators, async (req, res) => {
    const errors = validationResult(req); // получаем ошибки валдации (если есть)

    if (!errors.isEmpty()) {
        // если переменная с ошибками не пуста
        return res.status(401).json({ msg: errors.array()[0].msg });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ $or: [{ email: username }, { username }] });

    if (password) {
        const isEqual = await bcrypt.compare(password, user.password);

        if (isEqual) {
            const [userDTO, response] = await authorize(user);

            // устанавливаем cookie
            res.cookie('refreshToken', userDTO, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.status(201).json(response);
        } else {
            res.status(400).json({ msg: 'Неправильный пароль' });
        }
    } else {
        res.status(400).json({ msg: 'Пароль не указан' });
    }
});

router.post('/logout', auth, async (req, res) => {
    const { refreshToken } = req.cookies;

    const token = TokenService.removeToken(refreshToken);
    res.clearCookie('refreshToken');

    return res.json(token);
});

router.post('/refresh', auth, async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        res.status(400).json({ msg: 'Токен не существует' });
    }

    const userData = TokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = TokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
        res.status(401).json({ msg: 'Токен не существует' });
    }

    const user = await User.findById(userData.id);
    const [userDTO, response] = await authorize(user);

    // устанавливаем cookie
    res.cookie('refreshToken', userDTO, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.status(201).json(response);
});

router.post('/reset', (req, res) => {
    /*
        алгоритм сброса пароля:

        1. проверяем, существует ли пользователь
        2. генерируем токен, по которому будем ижентифицировать пользователя, + время жизни токена
        3. заносим данные в базу, модель пользователя
        4. отправляем email
        5. при входе пользователя по ссылке из email сверяем токены
        6. если токены верны, даём сменить пароль
        7. сохраняем новый пароль в базу
     */
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                return res.status(400).json({ msg: 'Что-то пошло не так, повторите попытку позже' });
            }

            const token = buffer.toString('hex');
            const candidate = await User.findOne({ email: req.body.email });

            if (candidate) {
                candidate.reset.token = token;
                candidate.reset.expires = Date.now() + 60 * 10 * 1000; // задаём время жизни токена в мс (60 сек * 60 минут * 1000)
                const current = await candidate.save();
                await transporter.sendMail(resetEmail(candidate.email, token));
                res.json(current);
            } else {
                res.status(400).json({ msg: 'Такого email не существует' });
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            'reset.token': req.body.token,
            'reset.expires': { $gt: Date.now() },
        });

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10); // шифрование пароля
            user.reset = undefined; // очищаем данные токена
            const current = await user.save(); // сохраняем пользователя
            res.json(current);
            await transporter.sendMail(passwordEmail(user.email));
        } else {
            res.status(400).json({ msg: 'Время жизни токена истекло' });
        }
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
