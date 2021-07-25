const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const project = new Schema({
    domain: {
        type: String,
        required: true
    },
    customerID: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    }
})

module.exports = model('Project', project)