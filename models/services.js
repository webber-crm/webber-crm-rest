const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const services = new Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = model('Services', services)