const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const role = new Schema({
    title: {
        type: String,
        required: true
    }
})

module.exports = model('Roles', role)