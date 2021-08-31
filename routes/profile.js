const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/user')
const Jobs = require('../models/jobs')
const Permissions = require('../models/permissions')
const ObjectId = require('mongoose').Types.ObjectId
const {validationResult} = require('express-validator')
const { profileValidators } = require('../utils/validators')
const router = Router()
const auth = require('../middleware/auth')
const func = require('./func/functions')

router.get('/', auth, async (req, res) => {

    const user = await User.findById(req.session.user._id).populate('job').populate('permissions')
    const birthday = user.birthday ? func.getFormattedDate(user.birthday) : ""

    const permissionsDB = await Permissions.find()
    const permissions = user.permissions ? permissionsDB.filter(r => r._id.toString() !== user.permissions._id.toString()) : permissionsDB

    const jobsDB = await Jobs.find()
    const jobs = user.job ? jobsDB.filter(f => f._id.toString() !== user.job._id.toString()) : jobsDB

    res.render('profile', {
        title: 'Профиль',
        user,
        birthday,
        jobs,
        permissions,
        error: req.flash('error')
    })
})

router.post('/', auth, profileValidators, async (req, res) => {
    const errors = validationResult(req) // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        req.flash('error', errors.array()[0].msg)
        return res.status(422).redirect('/profile')
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

    data.job = new ObjectId(req.body.job)
    data.birthday = new Date(req.body.birthday)

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

    await User.findByIdAndUpdate(id, data)
    res.redirect('/profile')
})

module.exports = router