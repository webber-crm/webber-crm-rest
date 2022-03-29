/**
 * Created by ASTAKHOV A.A. on 28.03.2022
 */

const { isValidObjectId } = require('mongoose');
const TaskModel = require('../models/task');
const ApiError = require('../exceptions/api-error');
const Task = require('../models/task');

class TaskService {
    async getAllTasks() {
        return TaskModel.find();
    }

    async create(taskData) {
        const task = new TaskModel(taskData);
        const current = await task.save(); // вызываем метод класса Task для сохранения в БД
        return current;
    }

    async getTaskById(id) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const task = await TaskModel.findById(id);

        if (!task) {
            throw ApiError.NotFound('Задача не найдена');
        }

        return task;
    }

    async edit(id, taskData) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const task = await Task.findByIdAndUpdate(id, taskData, { new: true });

        if (!task) {
            throw ApiError.NotFound('Задача не найдена');
        }

        return task;
    }

    async delete(id) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        await TaskModel.findByIdAndRemove(id);
    }
}

module.exports = new TaskService();
