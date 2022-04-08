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
        author: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customers',
        },
        status: {
            type: Schema.Types.ObjectId,
            ref: 'Status',
        },
        estimate: Number,
        actually: Number,
        deadline: String,
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
