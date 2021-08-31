/*
    process.env.NODE_ENV - значение, которое обычно добавляют хостинг-провайдеры
 */
if (process.env.NODE_ENV === 'production') {
    module.exports = require('./config.prod')
} else {
    module.exports = require('./config.dev')
}