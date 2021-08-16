const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/user')
const Jobs = require('../models/jobs')
const Roles = require('../models/role')
const ObjectId = require('mongoose').Types.ObjectId
const router = Router()
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {

    const user = await User.findOne({ email: req.session.user.email }).populate('job').populate('role')
    const birthday = user.birthday.toISOString().substring(0, 10)

    let roles = await Roles.find()
    roles = roles.filter(r => r._id.toString() !== user.role._id.toString())

    let jobs = await Jobs.find()
    jobs = jobs.filter(f => f._id.toString() !== user.job._id.toString())

    res.render('profile', {
        title: 'Профиль',
        user,
        birthday,
        jobs,
        roles
    })
})

router.post('/', auth, async (req, res) => {

    const { id } = req.body
    let data = req.body

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

    console.log(data)

    await User.findByIdAndUpdate(id, data)
    res.redirect('/profile')
})

module.exports = router