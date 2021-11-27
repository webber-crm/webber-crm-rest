const {Router} = require('express') // аналог const express.Router = require('express')
const Task = require('../models/tasks')
const {validationResult} = require('express-validator')
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

    switch(user.id.toString()) {
        case task.roles.creator.id.toString():
            role = 0;
            break;
        case task.roles.dev.id.toString():
            role = 1
            break;
        default:
            role = 2
            break;
    }

    return role
}

router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find()
        res.json(tasks)
    } catch (e) {
        throw Error(e)
    }
})

router.post('/', auth, taskValidators, async (req, res) => {
    const errors = validationResult(req) // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста

        return res.status(422).json({
            msg: errors.array()[0].msg,
        })
    }

    const {body} = req

    try {
        const task = new Task(body)
        const current = await task.save() // вызываем метод класса Task для сохранения в БД

        res.status(201).json(current)
    } catch (e) {
        throw Error(e)
    }
})

router.get('/:id', auth, async (req, res) => {
    /*
        req.params.id - получаем значение /:id
        course - получаем объект с курсом
     */
    const task = await Task.findById(req.params.id)

    res.json(task);
})

router.patch('/:id', auth, async (req, res) => {
    const {id} = req.params

    const errors = validationResult(req) // получаем ошибки валидации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        return res.status(422).json({msg: errors.array()[0].msg})
    }

    const {body} = req

    try {
        const current = await Task.findByIdAndUpdate(id, body, {new: true})
        res.json(current)
    } catch (e) {
        throw Error(e)
    }
})

router.delete('/:id', auth, async (req, res) => {
    await Task.findByIdAndRemove(req.params.id)
    res.status(204).json({});
})

module.exports = router