const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const customer = new Schema({
    name: {
        type: String,
        required: true
    },
    projects: [String],
    price: {
        type: Number
    },
    service: {
        type: Schema.Types.ObjectId,
        ref: 'Service'
    },
    info: {
        city: String,
        email: String,
        phone: String,
        website: String,
        contactPerson: String,
        dateFrom: {
            type: Date,
            default: Date.now()
        }
    },
    data: {
        inn: Number,
        kpp: Number,
        ogrn: Number,
        regDate: Date,
        director: String,
        address: String,
        bank: {
            title: String,
            account1: Number,
            account2: Number
        }
    },
    img: String
})

module.exports = model('Customer', customer)