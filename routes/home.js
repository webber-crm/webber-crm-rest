// Регистрация роута

const {Router} = require('express') // аналог const express.Router = require('express')
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
router.get('/', auth, (req, res) => {
    /*
        рендерим шаблон Handlebars:
        1 параметр - название страницы (без указания расширения .hbs), которая будет подключена
        2 параметр - объект с любыми нужными нам опциями. Например, передадим мета-title
    */
    res.render('index', {
        layout: 'main',
        title: 'Главная страница',
        isHome: true
    })
})

module.exports = router