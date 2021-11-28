const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const roles = new Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
});

module.exports = model('Roles', roles);
