const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const token = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
    },
    refresh_token: {
        type: String,
        required: true,
    },
});

module.exports = model('Token', token);
