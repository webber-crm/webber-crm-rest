/**
 * Created by ASTAKHOV A.A. on 28.03.2022
 */

const { isValidObjectId } = require('mongoose');
const TaskModel = require('../models/task');
const StatusModel = require('../models/directory/status');
const CustomerModel = require('../models/customer');
const ApiError = require('../exceptions/api-error');
const TaskDTO = require('../dto/task');
const PaginationService = require('./pagination-service');

class TaskService {
    async getAllTasks(user, page = 0, size = 10, ordering = '-createdAt', filter = {}) {
        const find = {
            ...filter,
            author: user._id,
            is_archive: filter.is_archive === 'true',
            is_done: filter.is_done === 'true',
        };

        const tasks = await TaskModel.find(find)
            .populate('status')
            .populate('customer')
            .limit(+page)
            .skip(size * page)
            .sort(ordering)
            .exec();

        const dto = tasks.map(task => new TaskDTO(task));
        const pagination = await PaginationService.getPagination(TaskModel, dto, size, find);

        return pagination;
    }

    async getTasks(user, filter = {}) {
        if (!isValidObjectId(user._id)) {
            throw ApiError.BadRequest('Не найден автор задачи');
        }

        const tasks = await TaskModel.find({ author: user._id, ...filter });

        if (!tasks) {
            throw ApiError.NotFound('Задача не найдена');
        }

        return tasks.map(task => new TaskDTO(task));
    }

    async getTaskById(id, user) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const task = await TaskModel.findOne({ _id: id, author: user._id }).populate('status').populate('customer');

        if (!task) {
            throw ApiError.NotFound('Задача не найдена');
        }

        return new TaskDTO(task);
    }

    async create(taskData, user) {
        const statusByDefault = await StatusModel.findOne({ status: 'NEW' });

        const customer = await CustomerModel.findOne({ _id: taskData.customer, user: user._id });

        const price =
            !taskData.is_fixed_price && taskData.estimate ? customer.price * taskData.estimate : taskData.price;

        const task = new TaskModel({
            ...taskData,
            author: user._id,
            status: statusByDefault.id,
            price,
        });

        const current = await task.save(); // вызываем метод класса Task для сохранения в БД
        return new TaskDTO(current);
    }

    async edit(id, taskData, user) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        // TODO: refactor

        const previousTask = await this.getTaskById(id, user);

        const customer = await CustomerModel.findOne({ user: user._id });

        const price =
            !taskData.is_fixed_price && taskData.estimate
                ? customer.price * taskData.estimate
                : taskData.price ?? previousTask.price;

        const statusFromDB = taskData.status ? await StatusModel.findById(taskData.status) : undefined;

        const is_done =
            taskData.is_done ||
            (taskData.status && statusFromDB.status === 'DONE') ||
            (!taskData.status && previousTask.status.status === 'DONE') ||
            false;

        const status = taskData.is_done
            ? await StatusModel.findOne({ status: 'DONE' }).select('_id')
            : taskData.status ?? previousTask.status;

        const task = await TaskModel.findOneAndUpdate(
            { _id: id, author: user._id },
            {
                ...taskData,
                price,
                is_done,
                status,
            },
            { new: true },
        );

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
                author: user._id,
            });
        }
    }
}

module.exports = new TaskService();
