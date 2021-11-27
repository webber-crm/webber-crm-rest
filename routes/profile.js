const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/users')
const Jobs = require('../models/jobs')
const Permissions = require('../models/roles')
const ObjectId = require('mongoose').Types.ObjectId
const {validationResult} = require('express-validator')
const { profileValidators } = require('../utils/validators')
const nodemailer = require('nodemailer') // подключаем общий пакет для отправки email
const sendgrid = require('nodemailer-sendgrid-transport') // пакет email для сервиса sendgrid
const keys = require('../config')
const deleteEmail = require('../emails/delete')
const router = Router()
const auth = require('../middleware/auth')
const func = require('./func/functions')

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

    const user = await User.findById(req.session.user._id).populate('job').populate('permissions')
    const birthday = user.birthday ? func.getFormattedDate(user.birthday) : ""

    const permissions = await func.getFilteredSelectListFromDB(Permissions, user.permissions)
    const jobs = await func.getFilteredSelectListFromDB(Jobs, user.job)

    // удаляем из списка должность с idx 0 в случае, если права доступа !== 0

    if (req.session.perm !== 0) {
        delete jobs[jobs.findIndex(job => job.idx === 0)]
    }

    res.json({
        user,
        birthday,
        jobs,
        permissions,
    })
})

router.post('/', auth, profileValidators, async (req, res) => {
    const errors = validationResult(req) // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        return res.status(422).json({msg: errors.array()[0].msg})
    }

    const id = req.session.user._id
    let data = req.body

    if (data.email !== req.session.user.email) {
        req.session.user.email = data.email
    }

    data.name = {
        first: req.body.firstname,
        last: req.body.lastname,
        middle: req.body.middlename
    }

    if (req.body.job) {
        data.job = new ObjectId(req.body.job)
    }

    if (data.birthday) {
        data.birthday = new Date(req.body.birthday)
    }

    delete data.id
    delete data.firstname
    delete data.lastname
    delete data.middlename

    if (req.files) {
        if (req.files.img) {
            const path = await func.uploadUserImage(req.files.img)
            data.img = path
        }
    }

    const current = await User.findByIdAndUpdate(id, data)
    res.json(current)
})

router.delete('/:id', auth, async (req, res) => {

    const { id } = req.params.id
    const { email } = req.session.user

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