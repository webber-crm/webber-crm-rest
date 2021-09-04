// Регистрация роута

const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/user')
const Task = require('../models/task')
const Customer = require('../models/customer')
const router = Router()
const auth = require('../middleware/auth')

/*
    обработка GET-запроса router.get()
    1 параметр request - запрос
    2 параметр response - ответ
    3 параметр next

    по аналогии есть другие метода для обработки разных типов запросов
    например: router.post(), router.put(), router.delete()
*/
router.get('/', auth, async (req, res) => {
    /*
        рендерим шаблон Handlebars:
        1 параметр - название страницы (без указания расширения .hbs), которая будет подключена
        2 параметр - объект с любыми нужными нам опциями. Например, передадим мета-title
    */
    const user = await User.findById(req.session.user._id)
    const tasks = await Task.find({$or: [{'roles.observers': {$in: [user._id]}}, {'roles.developer': user._id}, {'roles.author': user._id}]}).populate('status')
    const customers = await Customer.find({_id: {$in: user.customers}})

    const active = tasks.filter(task => task.status.idx === 2)
    const estimate = tasks.filter(task => task.status.idx === 1)

    const count = { active: active.length, estimate: estimate.length, total: tasks.length, customers: customers.length }

    res.render('index', {
        layout: 'main',
        title: 'Главная страница',
        count,
        isHome: true
    })
})

module.exports = router