const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const user = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            first: {
                type: String,
                default: 'Anonymous',
            },
            last: String,
            middle: String,
        },
        activationLink: String,
        is_active: {
            type: Boolean,
            default: false,
        },
        reset: {
            token: String,
            expires: Date,
        },
        job: {
            type: Schema.Types.ObjectId,
            ref: 'Job',
        },
        role: {
            type: Schema.Types.ObjectId,
            ref: 'Role',
            required: true,
        },
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = model('User', user);
