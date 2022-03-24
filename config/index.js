/*
    process.env.NODE_ENV - значение, которое обычно добавляют хостинг-провайдеры
 */

if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line global-require
    module.exports = require('./config.prod');
} else {
    // eslint-disable-next-line global-require
    module.exports = require('./config.dev');
}
