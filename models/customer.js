const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const customer = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        projects: [String],
        price: { type: Number },
        service: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true, id: true },
);

module.exports = model('Customer', customer);
