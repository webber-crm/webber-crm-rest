/*
    process.env.NODE_ENV - значение, которое обычно добавляют хостинг-провайдеры
 */
const dev = require('./config.dev');
const prod = require('./config.prod');

if (process.env.NODE_ENV === 'production') {
    module.exports = prod;
} else {
    module.exports = dev;
}
