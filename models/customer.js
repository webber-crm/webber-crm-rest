const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const customer = new Schema({
    name: {
        type: String,
        required: true
    },
    projects: [{
        domain: {
            type: Schema.Types.ObjectId,
            ref: 'Project'
        }
    }],
    price: {
        type: Number,
        required: true
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
        contactPerson: String
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
    }
})

module.exports = model('Customer', customer)