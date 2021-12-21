const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

const path = require('path');

const flash = require('connect-flash');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const compression = require('compression');
const fileupload = require('express-fileupload');

const cors = require('cors');
const keys = require('./config');

const errorHandler = require('./middleware/error');
const variables = require('./middleware/variables');

const authRoutes = require('./routes/auth');
const customersRoutes = require('./routes/customers');
const tasksRoutes = require('./routes/tasks');
const usersRoutes = require('./routes/users');
const rolesRoutes = require('./routes/roles');
const projectsRoutes = require('./routes/projects');

const app = express();

const store = new MongoStore({ connection: 'sessions', uri: keys.MONGODB_URI });

/*
    устанавливаем папку, в которой будут содержаться шаблоны html
    1 параметр - 'views' (хотим указать папку со страницами)
    2 параметр - название папки со страницами (по умолчанию 'views', но здесь указали явно на всякий случай)
*/
app.set('views', 'views');

/*
    добавляем папку public как статичную папку,
    от которой будут идти все статичные пути (/index.css)
*/
app.use(express.static(path.join(__dirname, 'assets')));

/*
    создаём настроку для корректного получения POST-запрос с формы через Express.js
 */
app.use(express.urlencoded({ extended: true }));

/*
    сессии express-session
 */
app.use(session({ secret: keys.SESSION_SECRET, saveUninitialized: true, resave: false, store }));

/*
    регистрируем Flash - обработка ошибок
 */
app.use(flash());

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

/*
 middleware для обработки файлов с POST-формы
 */
app.use(fileupload());

/*
 middleware для обработки запросов в body
 */
app.use(bodyParser.json());

app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:8000'],
        optionsSuccessStatus: 200, // For legacy browser support
    }),
);

/*
    регистрируем middleware,
    который добавляет переменную isAuth во все шаблоны через объект res
 */
app.use(variables);

/*
    регистрируем роуты app.use()
    1 параметр - префикс (путь)
    2 параметр - переменная с подключенным роутом
 */
app.use('/auth', authRoutes);
app.use('/tasks', tasksRoutes);

app.use('/users/roles', rolesRoutes);
app.use('/users', usersRoutes);

app.use('/customers/projects', projectsRoutes);
app.use('/customers', customersRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

async function start() {
    try {
        /*
            подключаемся к БД асинхронно, ожидаем успешного подключения с помощью await

            mongoose.connect() - метод подключения
            1 параметр - url от MongoDB
            2 параметр - различные опции | useNewUrlParser: true, useUnifiedTopology: true - для лучшей совместимости
         */
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });

        // app.listen() - аналог модуля HTTP, метод http.createServer()
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();
