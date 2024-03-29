const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const token = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
        },
        refreshToken: {
            type: String,
            required: true,
        },
    },
    { id: true },
);

module.exports = model('Token', token);
