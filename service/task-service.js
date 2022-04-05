/**
 * Created by ASTAKHOV A.A. on 28.03.2022
 */

const { isValidObjectId } = require('mongoose');
const TaskModel = require('../models/task');
const StatusModel = require('../models/directory/status');
const ApiError = require('../exceptions/api-error');
const TaskDTO = require('../dto/task');
const PaginationService = require('./pagination-service');

class TaskService {
    async getAllTasks(
        page = 0,
        size = 10,
        ordering = '-createdAt',
        filter = {
            show_inactive: undefined,
        },
    ) {
        const find = {
            is_active: typeof filter.show_inactive !== 'undefined' ? filter.show_inactive === 'false' : true,
        };

        const tasks = await TaskModel.find(find)
            .populate('status')
            .limit(+page)
            .skip(size * page)
            .sort(ordering)
            .exec();

        const dto = tasks.map(task => new TaskDTO(task));
        const pagination = await PaginationService.getPagination(TaskModel, dto, size, find);

        return pagination;
    }

    async getTaskById(id) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const task = await TaskModel.findById(id).populate('status');

        if (!task) {
            throw ApiError.NotFound('Задача не найдена');
        }

        return new TaskDTO(task);
    }

    async create(taskData) {
        const statusByDefault = await StatusModel.findOne({ status: 'NEW' });

        const task = new TaskModel(taskData);
        task.status = statusByDefault.id;

        const current = await task.save(); // вызываем метод класса Task для сохранения в БД
        return new TaskDTO(current);
    }

    async edit(id, taskData) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const task = await TaskModel.findByIdAndUpdate(id, taskData, { new: true });

        if (!task) {
            throw ApiError.NotFound('Задача не найдена');
        }

        return new TaskDTO(task);
    }

    async delete(id) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        await TaskModel.findByIdAndRemove(id);
    }
}

module.exports = new TaskService();
