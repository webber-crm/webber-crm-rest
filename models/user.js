const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const user = new Schema({
    login: {
        type: String,
        required: true
    },
    passwd: {
        type: String,
        required: true
    },
    name: {
        firstName: {
            type: String,
            required: true
        },
        lastName: String
    },
    birthday: Date,
    email: String,
    phone: String,
    city: String,
    price: {
        type: Number,
        required: true
    },
    img: String,
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Role'
    },
    permissions: {
        type: Schema.Types.ObjectId,
        ref: 'Permission'
    }
})

module.exports = model('User', user)