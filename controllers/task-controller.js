/**
 * Created by ASTAKHOV A.A. on 28.03.2022
 */

const { validationResult } = require('express-validator');
const TaskService = require('../service/task-service');
const ApiError = require('../exceptions/api-error');
const TaskDTO = require('../dto/task');

class TaskController {
    async getTasks(req, res, next) {
        try {
            const errors = validationResult(req); // получаем ошибки валдации (если есть)
            if (!errors.isEmpty()) {
                // если переменная с ошибками не пуста
                throw ApiError.BadRequest(errors.array()[0].msg);
            }

            const { page, size, ordering } = req.query;

            const tasks = await TaskService.getAllTasks(page, size, ordering);

            res.json(tasks);
        } catch (e) {
            next(e);
        }
    }

    async getTask(req, res, next) {
        try {
            const { id } = req.params;
            const task = await TaskService.getTaskById(id);
            res.json({ ...new TaskDTO(task) });
        } catch (e) {
            next(e);
        }
    }

    async create(req, res, next) {
        try {
            const errors = validationResult(req); // получаем ошибки валдации (если есть)
            if (!errors.isEmpty()) {
                // если переменная с ошибками не пуста
                throw ApiError.BadRequest(errors.array()[0].msg);
            }

            const { body } = req;

            const task = await TaskService.create(body);
            res.status(201).json(task);
        } catch (e) {
            next(e);
        }
    }

    async edit(req, res, next) {
        try {
            const errors = validationResult(req); // получаем ошибки валидации (если есть)
            if (!errors.isEmpty()) {
                // если переменная с ошибками не пуста
                throw ApiError.BadRequest(errors.array()[0].msg);
            }

            const { id } = req.params;
            const { body } = req;

            const task = await TaskService.edit(id, body);
            res.json(task);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            await TaskService.delete(req.params.id);
            res.status(204).json();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new TaskController();
