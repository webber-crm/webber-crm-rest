const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/user')
const Jobs = require('../models/jobs')
const Roles = require('../models/role')
const ObjectId = require('mongoose').Types.ObjectId
const router = Router()
const auth = require('../middleware/auth')
const path = require('path')
const fs = require('fs')

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

    const id = req.session.user._id
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

    if (req.files) {
        if (req.files.img) {
            delete data.img

            const uploads = path.join(__dirname, '..', 'assets', 'uploads')
            const images = path.join(__dirname, '..', 'assets', 'uploads', 'images')

            fs.stat(uploads, function(err) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        fs.mkdir(uploads, err => { // путь, callback
                            if (err) throw new Error(err) // вывод ошибки

                            console.log('Folder "uploads" created')
                        })
                    } else {
                        throw Error(err)
                    }
                }
            });

            fs.stat(images, function(err) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        fs.mkdir(images, err => { // путь, callback
                            if (err) throw new Error(err) // вывод ошибки

                            console.log('Folder "uploads" created')
                        })
                    } else {
                        throw Error(err)
                    }
                }
            });

            // создание файла fs.writeFile()
            const img = req.files.img
            const uploadPath = path.join(images, img.name)
            const imagePath = path.join('uploads', 'images', img.name)

            await img.mv(uploadPath, function(err) {
                if (err) throw new Error(err)
            });

            data.img = imagePath
        }
    }

    await User.findByIdAndUpdate(id, data)
    res.redirect('/profile')
})

module.exports = router