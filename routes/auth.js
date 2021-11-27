const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/users')
const Permissions = require('../models/roles')
const ObjectId = require('mongoose').Types.ObjectId
const {validationResult} = require('express-validator')
const { registerValidators, loginValidators } = require('../utils/validators')
const nodemailer = require('nodemailer') // подключаем общий пакет для отправки email
const sendgrid = require('nodemailer-sendgrid-transport') // пакет email для сервиса sendgrid
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const router = Router()
const keys = require('../config')
const registerEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const passwordEmail = require('../emails/password')

/*
    создаём transporter для sendgrid

    в метод createTransport передаём функцию из пакета "nodemailer-sendgrid-transport"
    внутри функции sendrid передаём объект конфигурации
 */
const transporter = nodemailer.createTransport(sendgrid({
    auth: {
        api_key: keys.SENDGRID_API_KEY // передаём ключ API, полученный в Sendgrid
    }
}))

router.post('/login', loginValidators, async (req, res) => {
    const errors = validationResult(req) // получаем ошибки валдации (если есть)

    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        return res.status(401).json({msg: errors.array()[0].msg})
    }

    const { email, password } = req.body
    const user = await User.findOne({ email }).populate('permissions')
    const permissions = user.permissions ? user.permissions.idx : -1

    if (req.body.password) {
        const isEqual = await bcrypt.compare(password, user.password)

        if (isEqual) {
            req.session.isAuthorized = true // устанавливаем ключ сессии isAuthenticated = true
            req.session.user = user
            req.session.perm = permissions

            /*
               сохраняем сессию, добавляем обработку,
               чтобы редирект не выполнился раньше, чем сохранится сессия
            */
            req.session.save(err => {
                if (err) {
                    throw err
                }

                const {name, _id, email, img} = user;
                res.json({name, _id, email, img})
            })
        }
    }
})

router.post('/register', registerValidators, async (req, res) => {

    try {
        const { email, password, name } = req.body

        const errors = validationResult(req) // получаем ошибки валдации (если есть)
        if (!errors.isEmpty()) { // если переменная с ошибками не пуста

            return res.status(400).json({
                msg: errors.array()[0].msg,
            })
        }

        /*
            создаём хэш пароля
         */
        const hashPassword = await bcrypt.hash(password, 10)
        const perm = await Permissions.findOne({idx: 4})

        const user = new User({
            email,
            password: hashPassword,
            name: {
                first: name
            },
            permissions: perm._id
        })

        const current = await user.save()
        res.json(current)

        /*
            отправляем письмо через метод sendMail() у transporter
            отправку письма рекомендуется делать после редиректов, чтобы не наблюдать задержек
         */
        await transporter.sendMail(registerEmail(email, name))
    } catch (e) {
        console.log(e)
    }

})

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
                req.flash('error', 'Что-то пошло не так, повторите попытку позже')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})

            if (candidate) {
                candidate.reset.token = token
                candidate.reset.expires = Date.now() + 60 * 10 * 1000 // задаём время жизни токена в мс (60 сек * 60 минут * 1000)
                const current = await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))
                res.json(current)
            } else {
                res.status(400).json({msg: 'Такого email не существует'})
            }
        })
    } catch (e) {
        console.log(e)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            'reset.token': req.body.token,
            'reset.expires': {$gt: Date.now()}
        })

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10) // шифрование пароля
            user.reset = undefined // очищаем данные токена
            const current = await user.save() // сохраняем пользователя
                res.json(current)
                await transporter.sendMail(passwordEmail(user.email))
        } else {
            res.status(400).json({msg: 'Время жизни токена истекло'})
        }
    } catch (e) {
        console.log(e)
    }
})


module.exports = router