const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const status = new Schema(
    {
        status: {
            type: String,
            required: true,
        },
        status_name: {
            type: String,
            required: true,
        },
    },
    { id: true },
);

module.exports = model('Status', status);
