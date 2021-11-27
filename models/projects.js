const { Schema, model } = require('mongoose'); // подключаем класс Schema и функцию model() из mongoose

const projects = new Schema({
    name: String,
    domain: {
        type: String,
        required: true,
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customers',
    },
});

module.exports = model('Projects', projects);
