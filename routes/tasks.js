const {Router} = require('express') // аналог const express.Router = require('express')
const Task = require('../models/task')
const router = Router()

router.get('/', (req, res) => {
    /*
        рендерим шаблон Handlebars:
        1 параметр - название страницы (без указания расширения .hbs), которая будет подключена
        2 параметр - объект с любыми нужными нам опциями. Например, передадим мета-title
    */
    res.render('tasks', {
        title: 'Задачи',
        isTasks: true
    })
})

router.get('/add', (req, res) => {
    res.render('add-task', {
        title: 'Новая задача'
    })
})

router.post('/add', async (req, res) => {
    console.log(req.body)

    const task = new Task({
        name: req.body.name,
        body: req.body.body,
        time: {estimate: req.body.estimate, fact: req.body.fact}
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