const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const customers = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        projects: [String],
        price: { type: Number },
        service: {
            type: Schema.Types.ObjectId,
            ref: 'Services',
        },
    },
    { timestamps: true, id: true },
);

module.exports = model('Customers', customers);
