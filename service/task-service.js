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
    async getAllTasks(user, page = 0, size = 10, ordering = '-createdAt', filter = {}) {
        const find = {
            ...filter,
            author: user.id,
            is_archive: filter.is_archive === 'true',
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

    async getTaskById(id, user) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const task = await TaskModel.findOne({ _id: id, author: user.id }).populate('status');

        if (!task) {
            throw ApiError.NotFound('Задача не найдена');
        }

        return new TaskDTO(task);
    }

    async create(taskData, user) {
        const statusByDefault = await StatusModel.findOne({ status: 'NEW' });

        const task = new TaskModel({ ...taskData, author: user.id, status: statusByDefault.id });

        const current = await task.save(); // вызываем метод класса Task для сохранения в БД
        return new TaskDTO(current);
    }

    async edit(id, taskData, user) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const task = await TaskModel.findOneAndUpdate({ _id: id, author: user.id }, taskData, { new: true });

        if (!task) {
            throw ApiError.NotFound('Задача не найдена');
        }

        return new TaskDTO(task);
    }

    async delete(id, user) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const task = await this.getTaskById(id, user);

        if (task) {
            await TaskModel.findOneAndRemove({
                _id: id,
                author: user.id,
            });
        }
    }
}

module.exports = new TaskService();
