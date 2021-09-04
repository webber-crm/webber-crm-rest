const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const status = new Schema({
    title: {
        type: String,
        required: true
    },
    idx: {
        type: Number,
        required: true,
        unique: true
    }
})

module.exports = model('Status', status)