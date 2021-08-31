const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const permission = new Schema({
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

module.exports = model('Permissions', permission)