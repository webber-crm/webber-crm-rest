const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const task = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: String,
        time: {
            estimate: Number,
            fact: Number,
            calc: {
                type: Number,
                default: 0,
            },
        },
        roles: {
            creator: {
                type: Schema.Types.ObjectId,
                ref: 'Users',
            },
            developer: {
                type: Schema.Types.ObjectId,
                ref: 'Users',
            },
            observers: {
                type: [Schema.Types.ObjectId],
                ref: 'Users',
            },
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customers',
        },
        status: String,
        comments: {
            type: [Schema.Types.ObjectId],
            ref: 'Comments',
        },
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = model('Task', task); // экспортируем модель, передаём схему task
