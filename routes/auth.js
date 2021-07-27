const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/user')
const ObjectId = require('mongoose').Types.ObjectId
const router = Router()
const crypto = require('crypto')

function encrypt(passwd) {
    return (
        crypto.createHash('sha1')
            .update(passwd)
            .digest('hex')
    )
}

router.get('/auth', async (req, res) => {

    if (!req.session.user) {
        res.render('auth', {
            title: 'Авторизация - Вход',
            layout: 'main'
        })
    } else {
        res.redirect('/')
    }
})

router.post('/auth', async (req, res) => {
    const users = await User.findOne({login: req.body.login})
        .then(user => {
            if (req.body.passwd) {
                const hash = encrypt(req.body.passwd)
                if (hash === user.passwd) {
                    req.session.user = user.id
                    res.redirect('/')
                } else {
                    console.log('Wrong password')
                    res.redirect('/auth')
                }
            } else {
                console.log('Password is not exist')
                res.redirect('/auth')
            }
        })
        .catch(err => {
            res.redirect('/auth')
            throw Error('User is not exist')
        })
})

module.exports = router