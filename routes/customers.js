const {Router} = require('express') // аналог const express.Router = require('express')
const Customer = require('../models/customer')
const Service = require('../models/service')
const router = Router()
const auth = require('../middleware/auth')
const func = require('./func/functions')

router.get('/', auth, async (req, res) => {

    const customers = await Customer.find()
    customers.forEach(customer => {
        customer.info.date = func.getFormattedDate(customer.info.dateFrom)
    })

    res.render('customers', {
        title: 'Клиенты',
        isCustomers: true,
        customers
    })
})

router.get('/add', auth, async (req, res) => {
    const services = await Service.find()

    res.render('add-customer', {
        title: 'Новый клиент',
        services,
        error: req.flash('error')
    })
})

router.post('/add', auth, async (req, res) => {

    const data = req.body

    if (!data.name) {
        req.flash('error', 'Укажите наименование')
        res.redirect('/customers/add')
    }

    data.projects = func.getJSONDataFromString(data.projects)

    if (data.dateFrom) {
        data.info = {...data.info, dateFrom: new Date(req.body.dateFrom)}
        delete data.dateFrom
    }

    if (req.files) {
        if (req.files.img) {
            delete data.img
            const path = await func.uploadUserImage(req.files.img)
            data.img = path
        }
    }

    const customer = new Customer(data)

    try {
        await customer.save() // вызываем метод класса Task для сохранения в БД

        // делаем редирект после отправки формы
        res.redirect('/customers')
    } catch (e) {
        console.log(e)
        res.end()
    }
})


router.get('/:id', auth, async (req, res) => {

    const customer = await Customer.findById(req.params.id).populate('service')
    const servicesDB = await Service.find()
    const services = servicesDB.filter(s => s._id.toString() !== customer.service._id.toString())
    const date = func.getFormattedDate(customer.info.dateFrom)

    customer.projects = JSON.stringify(customer.projects)

    res.render('edit-customer', {
        title: 'Редактирование карточки клиента',
        customer,
        services,
        date
    })
})

router.post('/edit', auth,async (req, res) => {
    const {id} = req.body // забираем id из объекта req.body в переменную
    delete req.body.id // удаляем req.body.id, так как в MongoDB поле называется "_id", а в нашем запросе "id"

    const data = req.body

    data.projects = func.getJSONDataFromString(data.projects)
    data.info = { ...data.info, dateFrom: new Date(req.body.dateFrom) }
    delete data.dateFrom

    if (req.files) {
        if (req.files.img) {
            const path = await func.uploadUserImage(req.files.img)
            data.img = path
        }
    }

    await Customer.findByIdAndUpdate(id, data)
    res.redirect('/customers')
})

router.get('/:id/delete', auth, async (req, res) => {
    await Customer.findByIdAndRemove(req.params.id)
    res.redirect('/customers')
})

module.exports = router