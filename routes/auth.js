const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/user')
const ObjectId = require('mongoose').Types.ObjectId
const router = Router()
const bcrypt = require('bcryptjs')

router.get('/login', async (req, res) => {

    if (!req.session.user) {
        res.render('auth/login', {
            title: 'Авторизация - Вход',
            layout: 'main',
            error: req.flash('error')
        })
    } else {
        res.redirect('/')
    }
})

router.get('/register', async (req, res) => {

    if (!req.session.user) {
        res.render('auth/register', {
            title: 'Регистрация',
            layout: 'main',
            error: req.flash('error')
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
                    req.flash('error', 'Неверный пароль')
                    console.log('Wrong password')
                    res.redirect('/auth/login')
                }
            } else {
                req.flash('error', 'Введите пароль')
                console.log('Password is not exist')
                res.redirect('/auth/login')
            }
        })
        .catch(err => {
            req.flash('error', 'Пользователя с таким email не существует')
            res.redirect('/auth/login')
            throw Error('User is not exist')
        })
})

router.post('/register', async (req, res) => {

    try {
        const { email, passwd, confirm, name } = req.body

        if (!email) {
            req.flash('error', 'Укажите email')
            res.redirect('/auth/register')
        }

        const candidate = await User.findOne({ email }) // email - то же, что и email: email

        if (candidate) {
            req.flash('error', 'Пользователь с таким email уже существует')
            res.redirect('/auth/register')
        } else {

            if (passwd !== confirm) {
                console.log('Passwords aren\'t identical')
                req.flash('error', 'Пароли не совпадают')
                res.redirect('/auth/register')
            }

            if (!name) {
                req.flash('error', 'Введите имя')
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