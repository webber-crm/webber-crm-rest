const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/user')
const ObjectId = require('mongoose').Types.ObjectId
const router = Router()
const bcrypt = require('bcryptjs')

router.get('/login', async (req, res) => {

    if (!req.session.user) {
        res.render('auth/login', {
            title: 'Авторизация - Вход',
            layout: 'main'
        })
    } else {
        res.redirect('/')
    }
})

router.get('/register', async (req, res) => {

    if (!req.session.user) {
        res.render('auth/register', {
            title: 'Регистрация',
            layout: 'main'
        })
    } else {
        res.redirect('/')
    }
})

router.post('/login', async (req, res) => {
    const { email, passwd } = req.body
    const users = await User.findOne({ email })
        .then(async (user) => {
            if (req.body.passwd) {
                const isEqual = await bcrypt.compare(passwd, user.passwd)

                if (isEqual) {
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

router.post('/register', async (req, res) => {

    try {
        const { email, passwd, confirm, name } = req.body
        const candidate = await User.findOne({ email }) // email - то же, что и email: email

        if (candidate) {
            res.redirect('/auth/register')
        } else {

            if (passwd !== confirm) {
                console.log('Passwords aren\'t identical')
                res.redirect('/auth/register')
            }

            /*
                создаём хэш пароля
             */
            const hashPassword = await bcrypt.hash(passwd, 10)

            const user = new User({
                email,
                passwd: hashPassword,
                name: {
                    first: name
                }
            })

            await user.save()
            res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }

})

router.get('/logout', async (req, res) => {
    // очищаем сессию
    req.session.destroy(() => {
        // callback-функция может использоваться для удаления сессии из MongoDB
        res.redirect('/auth/login')
    })
})

module.exports = router