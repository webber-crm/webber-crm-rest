const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const users = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    reset: {
        token: String,
        expires: Date,
    },
    name: {
        first: {
            type: String,
            required: true,
        },
        last: String,
        middle: String,
    },
    price: Number,
    is_active: {
        type: Boolean,
        default: true,
    },
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Jobs',
    },
    role: {
        type: String,
        required: true,
    },
});

module.exports = model('Users', users);
