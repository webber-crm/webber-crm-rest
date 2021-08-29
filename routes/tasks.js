const {Router} = require('express') // аналог const express.Router = require('express')
const Task = require('../models/task')
const User = require('../models/user')
const {validationResult} = require('express-validator')
const ObjectId = require('mongoose').Types.ObjectId
const router = Router()
const auth = require('../middleware/auth')
const { taskValidators } = require('../utils/validators')

router.get('/', auth, async (req, res) => {
    /*
        рендерим шаблон Handlebars:
        1 параметр - название страницы (без указания расширения .hbs), которая будет подключена
        2 параметр - объект с любыми нужными нам опциями. Например, передадим мета-title
    */

    const data = await Task.find().populate('roles.developer')

    const tasks = data.filter(t => {
        if (t.roles) {
            // получаем список пользователей внутри roles
            const users = Object.values(t.roles).map(v => v.toString())

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

router.get('/add', auth, (req, res) => {
    res.render('tasks/add', {
        title: 'Новая задача'
    })
})

router.post('/edit', auth, taskValidators, async (req, res) => {
    const {id} = req.body // забираем id из объекта req.body в переменную

    const errors = validationResult(req) // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        req.flash('error', errors.array()[0].msg)
        return res.status(422).redirect(`/tasks/${id}`)
    }

    delete req.body.id // удаляем req.body.id, так как в MongoDB поле называется "_id", а в нашем запросе "id"
    const body = {
        name: req.body.name,
        body: req.body.body,
        time: {
            estimate: req.body.estimate,
            fact: req.body.fact
        }
    }
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

    const task = await Task.findById(req.params.id)

    if (!task) {
        return set404Error()
    }

    if (task.roles) {
        const users = Object.values(task.roles).map(v => v.toString())

        // если текущий пользователь присутствует в списке пользователей задачи
        if (users.includes(req.session.user._id.toString())) {
            res.render('tasks/edit', {
                title: `Задача #${task._id}`, // устанавливаем мета-title
                task, // передаём объект задачи
                error: req.flash('error')
            })
        } else {
            res.status(403).render('tasks/forbidden', {
                title: 'Доступ запрещён', // устанавливаем мета-title
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
        req.flash('error', errors.array()[0].msg)

        return res.status(422).render('tasks/add', {
            title: 'Новая задача', // устанавливаем мета-title
            error: req.flash('error'),
            data: {
                name,
                body
            }
        })
    }

    const tasks = await Task.find()

    const task = new Task({
        name: req.body.name,
        body: req.body.body,
        time: {estimate: req.body.estimate, fact: req.body.fact},
        idx: tasks.length + 1,
        roles: {
            author: ObjectId(req.session.user._id),
            developer: ObjectId(req.session.user._id)
        }
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