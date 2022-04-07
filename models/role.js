const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const role = new Schema(
    {
        role: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        role_name: {
            type: String,
            required: true,
        },
    },
    { id: true },
);

module.exports = model('Role', role);
