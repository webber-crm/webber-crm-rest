const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const path = require('path')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const { MONGODB_URI } = require('./config')

const variables = require('./middleware/variables')

const homeRoutes = require('./routes/home')
const tasksRoutes = require('./routes/tasks')
const authRoutes = require('./routes/auth')

const app = express()

const hbs = exphbs.create({
    defaultLayout: 'default', // шаблон по умолчанию
    extname: 'hbs', // расширение страниц (views) и шаблонов (layouts) - (по умолчанию .handlebars)
    handlebars: allowInsecurePrototypeAccess(Handlebars) // исправляем ошибку при запросе с MongoDB
})

const store = new MongoStore({
    connection: 'sessions',
    uri: MONGODB_URI
})

/*
    регистрируем движок Handlebars в Express.js
    1 параметр - название движка (задаётся на своё усмотрение)
    2 параметр - передаём движок, указанный в переменной hbs
*/
app.engine('hbs', hbs.engine)

/*
    подключаем Handlebars в качестве движка для рендеринга html:
    1 параметр - 'view engine' (даём Express.js понять, что хотим подключить именно движок)
    2 параметр - название движка, указанный в 1 параметре app.engine()
*/
app.set('view engine', 'hbs')

/*
    устанавливаем папку, в которой будут содержаться шаблоны html
    1 параметр - 'views' (хотим указать папку со страницами)
    2 параметр - название папки со страницами (по умолчанию 'views', но здесь указали явно на всякий случай)
*/
app.set('views', 'views')

/*
    добавляем папку public как статичную папку,
    от которой будут идти все статичные пути (/index.css)
*/
app.use(express.static(path.join(__dirname, 'assets')))

/*
    создаём настроку для корректного получения POST-запрос с формы через Express.js
 */
app.use(express.urlencoded({extended: true}))

/*
    сессии express-session
 */
app.use(session({
    secret: 'studio',
    saveUninitialized: true,
    resave: false,
    store
}))

/*
    регистрируем middleware,
    который добавляет переменную isAuth во все шаблоны через объект res
 */
app.use(variables)

/*
    регистрируем роуты app.use()
    1 параметр - префикс (путь)
    2 параметр - переменная с подключенным роутом
 */
app.use('/', homeRoutes) // регистрируем роут home.js
app.use('/tasks', tasksRoutes)
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 3000

async function start() {
    try {
        /*
            подключаемся к БД асинхронно, ожидаем успешного подключения с помощью await

            mongoose.connect() - метод подключения
            1 параметр - url от MongoDB
            2 параметр - различные опции | useNewUrlParser: true, useUnifiedTopology: true - для лучшей совместимости
         */
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })

        // app.listen() - аналог модуля HTTP, метод http.createServer()
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })

    } catch (e) {
        console.log(e)
    }
}

start()