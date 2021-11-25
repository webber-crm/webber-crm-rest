const {Router} = require('express') // аналог const express.Router = require('express')
const Task = require('../models/task')
const Status = require('../models/status')
const {validationResult} = require('express-validator')
const ObjectId = require('mongoose').Types.ObjectId
const router = Router()
const auth = require('../middleware/auth')
const { taskValidators, taskEditValidators } = require('../utils/validators')

function getTaskPrices(task) {
    const price = {
        customer: task.customer && task.customer.price ? task.customer.price : 0,
        developer: task.roles.developer && task.roles.developer.price ? task.roles.developer.price : 0
    }

    const result = { customer: 0, developer: 0 }

    // если определён разработчик по задаче
    if (price) {
        if (price.customer) {
            // рассчитываем стоимость выполнения задачи
            result.customer = task.time.estimate * price.customer
        }

        if (price.developer) {
            result.developer = task.time.estimate * price.developer
        }
    }

    return result
}

function getUserRoleInTheTask(user, task) {
    let role;

    switch(user._id.toString()) {
        case task.roles.author._id.toString():
            role = 0;
            break;
        case task.roles.developer._id.toString():
            role = 1
            break;
        default:
            role = 2
            break;
    }

    return role
}

router.get('/', auth, async (req, res) => {
    /*
        рендерим шаблон Handlebars:
        1 параметр - название страницы (без указания расширения .hbs), которая будет подключена
        2 параметр - объект с любыми нужными нам опциями. Например, передадим мета-title
    */

    const { user } = req.session
    const status = req.query.status ? await Status.findOne({idx: +req.query.status}) : null
    const find = req.query.status ? {status: {$in: status._id}} : {}
    const data = await Task.find({$or: [{'roles.observers': {$in: [user._id]}}, {'roles.developer': user._id}, {'roles.author': user._id}], ...find}).populate('roles.developer').populate('customer')

    const tasks = data.map((task) => {
        task.price = getTaskPrices(task)
        task.userrole = getUserRoleInTheTask(user, task)

        return task
    })

    res.json(tasks)
})

router.put('/:id', auth, taskEditValidators, async (req, res) => {
    const {id, role} = req.body // забираем id из объекта req.body в переменную
    delete req.body.id // удаляем req.body.id, так как в MongoDB поле называется "_id", а в нашем запросе "id"

    const errors = validationResult(req) // получаем ошибки валидации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        return res.status(422).json({msg: errors.array()[0].msg})
    }

    const task = await Task.findById(id)
    const keys = Object.keys(req.body)

    keys.forEach(k => {
        task[k] = req.body[k]
    })
    task.states.updated = Date.now()
    task.roles.developer = req.body.developer
    task.roles.observers = req.body.observers

    const body = +role === 0 ? task : { time: { estimate: req.body.estimate, fact: req.body.fact } }

    const current = await Task.findByIdAndUpdate(id, body)
    res.json(current)
})

router.get('/:id', auth, async (req, res) => {
    /*
        req.params.id - получаем значение /:id
        course - получаем объект с курсом
     */
    const task = await Task.findById(req.params.id).populate('roles.author').populate('roles.developer').populate('customer').populate('status')

    res.json(task);
})

router.delete('/:id', auth, async (req, res) => {
    await Task.findByIdAndRemove(req.params.id)
    res.status(204).json({});
})

router.post('/', auth, taskValidators, async (req, res) => {
    const errors = validationResult(req) // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста

        return res.status(422).json({
            msg: errors.array()[0].msg,
        })
    }

    const status = await Status.findOne({idx: 1})
    const { observers } = req.body

    const task = new Task({
        name: req.body.name,
        body: req.body.body,
        time: {estimate: req.body.estimate, fact: req.body.fact},
        roles: {
            author: ObjectId(req.session.user._id),
            developer: ObjectId(req.body.developer),
            observers
        },
        customer: req.body.customer,
        project: req.body.project,
        status: ObjectId(status._id)
    })

    try {
        const current = await task.save() // вызываем метод класса Task для сохранения в БД

        res.status(201).json(current)
    } catch (e) {
        console.log(e)
        res.end()
    }
})

module.exports = router