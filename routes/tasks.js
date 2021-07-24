const {Router} = require('express') // аналог const express.Router = require('express')
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

module.exports = router