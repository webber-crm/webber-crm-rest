// подключаем функциб проверки body из пакета express-validator
const { body } = require('express-validator')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.registerValidators = [
    body('email')
        .isEmail()
        .withMessage('Введите корректный Email')
        .custom(async (value, {req}) => {
            try {
                // ищем пользователя с полученным email
                const user = await User.findOne({ email: value })
                if (user) { // если пользователь найден
                    return Promise.reject('Такой email уже занят')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(), // санитайзер, нормализует Email
    body('password', 'Пароль должен быть минимум 8 символов')
        .isLength({min: 8, max: 32})
        .isAlphanumeric()
        .trim(), // санитайзер trim, удаляет пробелы по краям
    body('confirm').custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать')
            }
            return true
        })
        .trim(),

    /*
        валидируем имя
     */
    body('name')
        .isLength({min: 3})
        .withMessage('Имя должно включать минимум 3 символа')
        .trim()
]

exports.loginValidators = [
    body('email')
        .isEmail()
        .withMessage('Введите корректный Email')
        .custom(async (value, {req}) => {
            try {
                // ищем пользователя с полученным email
                const user = await User.findOne({ email: value })
                if (!user) { // если пользователь НЕ найден
                    return Promise.reject('Пользователя с таким email не существует')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(), // санитайзер, нормализует Email
    body('password', 'Пароль должен быть минимум 6 символов')
        .isLength({min: 6, max: 56})
        .isAlphanumeric()
        .trim() // санитайзер trim, удаляет пробелы по краям
        .custom(async (value, {req}) => {
            try {
                // ищем пользователя с полученным email
                const user = await User.findOne({ email: req.body.email })

                if (user) {
                    const compare = await bcrypt.compare(value, user.password)
                    if (!compare) { // если пароль не верный
                        return Promise.reject('Неверный пароль')
                    }
                } else {
                    return Promise.reject('Пользователь с таким email не найден')
                }
            } catch (e) {
                console.log(e)
            }
        })
]

exports.taskValidators = [
    body(['name', 'body'], 'Название и тело задачи должно быть длинее 3 символов')
        .isLength({min: 3})
        .trim()
]

exports.customersValidators = [
    body('name', 'Наименование не должно быть пустым').isLength({min: 1}),
    body('price')
        .isLength({min: 3}).withMessage('Цена должна быть от 3 символов')
        .isNumeric().withMessage('Цена должна содержать только цифры')
        .trim(),
    body('projects').custom((value, {req}) => {
        if (!value) {
            throw new Error('У клиента должен быть хотя бы 1 проект')
        }

        return true
    })
]

exports.profileValidators = [
    body('firstname', 'Имя  не должно быть пустым')
        .isLength({min: 1})
        .trim(),
    body('email')
        .isEmail()
        .withMessage('Введите корректный Email')
        .custom(async (value, {req}) => {
            try {
                const { email } = req.session.user
                // ищем пользователя с полученным email
                const candidate = await User.findOne({ email: value })
                if (candidate && candidate.email !== email) { // если пользователь найден И этот пользователь не текущий
                    return Promise.reject('Этот email уже занят')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(), // санитайзер, нормализует Email
]