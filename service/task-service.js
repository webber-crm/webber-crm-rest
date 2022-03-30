/**
 * Created by ASTAKHOV A.A. on 28.03.2022
 */

const { isValidObjectId } = require('mongoose');
const TaskModel = require('../models/task');
const ApiError = require('../exceptions/api-error');
const Task = require('../models/task');
const TaskDTO = require('../dto/task');
const PaginationService = require('./pagination-service');

class TaskService {
    async getAllTasks(page = 0, size = 10, ordering = '-createdAt') {
        const tasks = await TaskModel.find()
            .limit(page)
            .skip(size * page)
            .sort(ordering)
            .exec();

        const dto = tasks.map(task => new TaskDTO(task));
        const pagination = await PaginationService.getPagination(TaskModel, dto, size);

        return pagination;
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
