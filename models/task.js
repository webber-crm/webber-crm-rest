const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const task = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: String,
        is_active: {
            type: Boolean,
            default: true,
        },
        is_archive: {
            type: Boolean,
            default: false,
        },
        is_done: {
            type: Boolean,
            default: false,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
        },
        status: {
            type: Schema.Types.ObjectId,
            ref: 'Status',
        },
        deadline: String,
        estimate: Number,
        actually: Number,
        is_fixed_price: Boolean,
        price: Number,
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
