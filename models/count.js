const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const count = new Schema({
    count: {
        type: Number,
        default: 1,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true,
    },
});

module.exports = model('Count', count);
