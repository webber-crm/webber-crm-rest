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

router.get('/login', async (req, res) => {

    if (!req.session.user) {
        res.render('auth', {
            title: 'Авторизация - Вход',
            layout: 'main'
        })
    } else {
        res.redirect('/')
    }
})

router.post('/login', async (req, res) => {

    const users = await User.findOne({login: req.body.login})
        .then(user => {
            if (req.body.passwd) {
                const hash = encrypt(req.body.passwd)
                if (hash === user.passwd) {
                    req.session.isAuthorized = true // устанавливаем ключ сессии isAuthenticated = true
                    req.session.user = user

                    /*
                       сохраняем сессию, добавляем обработку,
                       чтобы редирект не выполнился раньше, чем сохранится сессия
                    */
                    req.session.save(err => {
                        if (err) {
                            throw err
                        }
                        res.redirect('/')
                    })

                } else {
                    console.log('Wrong password')
                    res.redirect('/auth/login')
                }
            } else {
                console.log('Password is not exist')
                res.redirect('/auth/login')
            }
        })
        .catch(err => {
            res.redirect('/auth/login')
            throw Error('User is not exist')
        })
})

router.get('/logout', async (req, res) => {
    // очищаем сессию
    req.session.destroy(() => {
        // callback-функция может использоваться для удаления сессии из MongoDB
        res.redirect('/auth/login')
    })
})

module.exports = router