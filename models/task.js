const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const task = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        text: String,
        time: {
            est: Number,
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
            dev: {
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
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Projects',
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customers',
        },
        status: {
            type: Schema.Types.ObjectId,
            ref: 'Status',
        },
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
