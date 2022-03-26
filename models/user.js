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
        salary: Number,
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
            ref: 'Jobs',
        },
        role: {
            type: Schema.Types.ObjectId,
            ref: 'Roles',
        },
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = model('Users', user);
