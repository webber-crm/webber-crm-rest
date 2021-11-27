const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/users')
const {validationResult} = require('express-validator')
const { usersValidators } = require('../utils/validators')
const nodemailer = require('nodemailer') // подключаем общий пакет для отправки email
const sendgrid = require('nodemailer-sendgrid-transport') // пакет email для сервиса sendgrid
const keys = require('../config')
const deleteEmail = require('../emails/delete')
const router = Router()
const auth = require('../middleware/auth')
const bcrypt = require("bcryptjs");
const registerEmail = require("../emails/registration");

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

router.get('/', auth, async (req, res) => {

    const users = await User.find()
    res.json(users)
})

router.post('/', async (req, res) => {

    try {
        const { password, ...body } = req.body
        const { name, email } = body

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

        const user = new User({
            ...body,
            password: hashPassword
        })

        const current = await user.save()
        res.json(current)

        /*
            отправляем письмо через метод sendMail() у transporter
            отправку письма рекомендуется делать после редиректов, чтобы не наблюдать задержек
         */
        await transporter.sendMail(registerEmail(email, name.first))
    } catch (e) {
        console.log(e)
    }

})

router.get('/:id', auth, async (req, res) => {
    const { id } = req.params

    const user = await User.findById(id)
    res.json(user)
})

router.patch('/:id', auth, usersValidators, async (req, res) => {
    const { id } = req.params

    const errors = validationResult(req) // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        return res.status(422).json({msg: errors.array()[0].msg})
    }

    const {body} = req

    const current = await User.findByIdAndUpdate(id, body)
    res.json(current)
})

router.delete('/:id', auth, async (req, res) => {

    const { id } = req.params
    const { email } = await User.findById(id)

    await User.findByIdAndDelete(id)

    // очищаем сессию
    req.session.destroy(async () => {
        // callback-функция может использоваться для удаления сессии из MongoDB
        res.status(204).json({})

        /*
            отправляем письмо через метод sendMail() у transporter
            отправку письма рекомендуется делать после редиректов, чтобы не наблюдать задержек
         */
        await transporter.sendMail(deleteEmail(email))
    })
})

module.exports = router