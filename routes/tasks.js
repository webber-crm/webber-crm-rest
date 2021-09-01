const {Router} = require('express') // аналог const express.Router = require('express')
const Task = require('../models/task')
const User = require('../models/user')
const Customer = require('../models/customer')
const {validationResult} = require('express-validator')
const ObjectId = require('mongoose').Types.ObjectId
const router = Router()
const auth = require('../middleware/auth')
const func = require('./func/functions')
const { taskValidators, taskEditValidators } = require('../utils/validators')

router.get('/', auth, async (req, res) => {
    /*
        рендерим шаблон Handlebars:
        1 параметр - название страницы (без указания расширения .hbs), которая будет подключена
        2 параметр - объект с любыми нужными нам опциями. Например, передадим мета-title
    */

    const data = await Task.find().populate('roles.developer').populate('customer')

    const tasks = data.filter(t => {
        if (t.roles) {
            // получаем список наблюдателей внутри roles (observers)
            const observers = t.roles.observers ? t.roles.observers.map(obj => obj._id) : [];

            // получаем список пользователей, которые имеют доступ к задаче (находятся внутри roles)
            const users = [t.roles.author, ( t.roles.developer ? t.roles.developer._id : null )]
                .concat(observers)
                .map(item => item ? item.toString() : item)

            // если текущий пользователь присутствует в списке пользователей задачи
            if (users.includes(req.session.user._id.toString())) {
                return t
            }
        }
    }).map(t => {
        // если определён разработчик по задаче
        if (t.roles.developer && t.roles.developer.price) {
            // рассчитываем стоимость выполнения задачи
            t.price = t.time.estimate * t.roles.developer.price
        }

        return t
    })

    res.render('tasks', {
        title: 'Задачи',
        isTasks: true,
        tasks
    })
})

router.get('/add', auth, async (req, res) => {
    const user = await User.findById(req.session.user._id)

    const users = await User.find()
    const customers = await Customer.find({_id: {$in: user.customers}})

    res.render('tasks/add', {
        title: 'Новая задача',
        users,
        customers
    })
})

router.post('/edit', auth, taskEditValidators, async (req, res) => {
    const {id, role} = req.body // забираем id из объекта req.body в переменную

    const errors = validationResult(req) // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        req.flash('error', errors.array()[0].msg)
        return res.status(422).redirect(`/tasks/${id}`)
    }

    delete req.body.id // удаляем req.body.id, так как в MongoDB поле называется "_id", а в нашем запросе "id"

    const body = role === 0 ? {
        name: req.body.name,
        body: req.body.body,
        time: {
            estimate: req.body.estimate,
            fact: req.body.fact
        },
        roles: {
            author: req.body.author,
            developer: req.body.developer,
            observers: req.body.observers
        },
        customer: req.body.customer,
        project: req.body.project
    } : { time: { estimate: req.body.estimate, fact: req.body.fact } }

    await Task.findByIdAndUpdate(id, body)

    res.redirect('/tasks')
})

router.get('/:id', auth, async (req, res) => {
    /*
        req.params.id - получаем значение /:id
        course - получаем объект с курсом
     */

    function set404Error() {
        res.status(404).render('tasks/error', {
            title: 'Ошибка 404: Задача не найдена', // устанавливаем мета-title
        })
    }

    if (!ObjectId.isValid(req.params.id)) {
        return set404Error()
    }

    const user = await User.findById(req.session.user._id) // текущий пользователь из сессии
    const roles = await Task.findById(req.params.id, 'roles')

    if (!roles) {
        return set404Error()
    }

    const task = await Task.findById(req.params.id).populate('roles.author').populate('roles.developer').populate('customer')
    const users = await User.find() // получаем всех пользователей
    const customers = await func.getFilteredArrayFromDB(Customer, task.customer, user.customers)

    const observers = roles.roles.observers ? roles.roles.observers.map(obj => obj._id) : []

    // список ID всех участников задачи (независимо от роли)
    const members = Object.values(roles.roles)
        .filter(i => typeof i === 'object' && !Array.isArray(i))
        .concat(observers)

    if (roles) {
        const membersToString = members.map(v => v ? v.toString() : []) // массив members, но элементы преобразованы в строку
        const usersFromObservers = await User.find({_id: {$in: observers}}) // пользовательские данные наблюдателей
        const usersFromRoles = {...task.roles.toObject(), observers: usersFromObservers } // пользовательские данные всех участников задачи по ролям

        switch(user._id.toString()) {
            case task.roles.author._id.toString():
                user.role = 0;
                break;
            case task.roles.developer._id.toString():
                user.role = 1
                break;
            default:
                user.role = 2
                break;
        }

        // получаем массив с объектами пользователей, где к каждому объекту добавлено свойство selected (выбран разработчик задачи)
        users.dev = func.getFilteredSelectList(users, usersFromRoles.developer)

        // массив с объектами пользователями, где в объектах отмечены наблюдатели (через свойство selected)
        users.observers = func.getFilteredSelectList(users, observers)

        // если текущий пользователь присутствует в списке пользователей задачи
        if (membersToString.includes(req.session.user._id.toString())) {

            res.render('tasks/edit', {
                title: `Задача #${task._id}`, // устанавливаем мета-title
                task, // передаём объект задачи
                roles: usersFromRoles,
                users,
                customers,
                user,
                error: req.flash('error')
            })
        } else {
            res.status(403).render('tasks/forbidden', {
                title: 'Доступ запрещён', // устанавливаем мета-title
                layout: 'empty'
            })
        }
    }
})

router.get('/:id/delete', auth, async (req, res) => {
    await Task.findByIdAndRemove(req.params.id)
    res.redirect('/tasks')
})

router.get('/:id/turn-off', auth, async (req, res) => {
    await Task.findByIdAndUpdate(req.params.id, {active: false})
    res.redirect('/tasks')
})

router.get('/:id/turn-on', auth, async (req, res) => {
    await Task.findByIdAndUpdate(req.params.id, {active: true})
    res.redirect('/tasks')
})

router.post('/add', auth, taskValidators, async (req, res) => {
    const errors = validationResult(req) // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        const {name, body} = req.body
        const user = await User.findById(req.session.user._id)

        const users = await User.find()
        const customers = await Customer.find({_id: {$in: user.customers}})

        req.flash('error', errors.array()[0].msg)

        return res.status(422).render('tasks/add', {
            title: 'Новая задача', // устанавливаем мета-title
            error: req.flash('error'),
            users,
            customers,
            data: {
                name,
                body
            }
        })
    }

    const tasks = await Task.find()

    const observersFromBody = req.body.observers
    const observers = observersFromBody && Array.isArray(observersFromBody) ?
        observersFromBody.map(item => ObjectId(item) ) :
        [ ObjectId(observersFromBody) ]

    const task = new Task({
        name: req.body.name,
        body: req.body.body,
        time: {estimate: req.body.estimate, fact: req.body.fact},
        idx: tasks.length + 1,
        roles: {
            author: ObjectId(req.session.user._id),
            developer: ObjectId(req.body.developer),
            observers
        },
        customer: req.body.customer,
        project: req.body.project
    })

    try {
        await task.save() // вызываем метод класса Task для сохранения в БД

        // делаем редирект после отправки формы
        res.redirect('/tasks')
    } catch (e) {
        console.log(e)
        res.end()
    }
})

module.exports = router