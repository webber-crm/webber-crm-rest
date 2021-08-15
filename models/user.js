const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const user = new Schema({
    email: {
        type: String,
        required: true
    },
    passwd: {
        type: String,
        required: true
    },
    name: {
        first: {
            type: String,
            required: true
        },
        last: String
    },
    birthday: Date,
    phone: String,
    city: String,
    price: Number,
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