const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const job = new Schema({
    name: {
        type: String,
        required: true,
    },
});

module.exports = model('Jobs', job);
