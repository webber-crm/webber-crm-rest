const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const service = new Schema({
    service: {
        type: String,
        required: true,
    },
    service_name: {
        type: String,
        required: true,
    },
});

module.exports = model('Service', service);
