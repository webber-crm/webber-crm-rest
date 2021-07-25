const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const perm = new Schema({
    title: {
        type: String,
        required: true
    }
})

module.exports = model('Permission', perm)