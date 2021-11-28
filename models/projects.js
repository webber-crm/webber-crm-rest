const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const projects = new Schema({
    name: {
        type: String,
        required: true,
    },
    domain: {
        type: String,
        required: true,
    },
});

module.exports = model('Projects', projects);
