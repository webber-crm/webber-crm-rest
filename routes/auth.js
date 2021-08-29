const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/user')
const {validationResult} = require('express-validator')
const { registerValidators, loginValidators } = require('../utils/validators')
const bcrypt = require('bcryptjs')
const router = Router()

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
    const { email, password } = req.body
    const users = await User.findOne({ email })
        .then(async (user) => {
            if (req.body.password) {
                const isEqual = await bcrypt.compare(password, user.password)

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

router.post('/register', registerValidators, async (req, res) => {

    try {
        const { email, password, name } = req.body

        const errors = validationResult(req) // получаем ошибки валдации (если есть)
        if (!errors.isEmpty()) { // если переменная с ошибками не пуста
            req.flash('error', errors.array()[0].msg)

            return res.status(422).render('auth/register', {
                title: 'Регистрация',
                layout: 'main',
                error: req.flash('error'),
                data: {
                    email,
                    password,
                    name
                }
            })
        }

        /*
            создаём хэш пароля
         */
        const hashPassword = await bcrypt.hash(password, 10)

        const user = new User({
            email,
            password: hashPassword,
            name: {
                first: name
            }
        })

        await user.save()
        res.redirect('/auth/login')
    } catch (e) {
        console.log(e)
    }

})

router.get('/logout', loginValidators, async (req, res) => {
    // очищаем сессию
    req.session.destroy(() => {
        // callback-функция может использоваться для удаления сессии из MongoDB
        res.redirect('/auth/login')
    })
})

module.exports = router