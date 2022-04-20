/**
 * Created by ASTAKHOV A.A. on 28.03.2022
 */

const { isValidObjectId } = require('mongoose');
const CustomerModel = require('../models/customer');
const ApiError = require('../exceptions/api-error');
const CustomerDTO = require('../dto/customer');
const PaginationService = require('./pagination-service');
const TaskService = require('./task-service');

class CustomerService {
    async getAllCustomers(user, page = 0, size = 25, ordering = '-createdAt', filter = {}) {
        const find = {
            ...filter,
            user: user._id,
            is_archive: filter.is_archive === 'true',
        };

        const customers = await CustomerModel.find(find)
            .populate('service')
            .limit(+page)
            .skip(size * page)
            .sort(ordering)
            .exec();

        const dto = customers.map(customer => new CustomerDTO(customer));
        const pagination = await PaginationService.getPagination(CustomerModel, dto, size, find);

        return pagination;
    }

    async getCustomerById(id, user) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const customer = await CustomerModel.findOne({ _id: id, user: user._id }).populate('user').populate('service');

        if (!customer) {
            throw ApiError.NotFound('Клиент не найден');
        }

        return new CustomerDTO(customer);
    }

    async create(customerData, user) {
        const customer = new CustomerModel({ ...customerData, user: user._id });

        const current = await customer.save(); // вызываем метод класса Customer для сохранения в БД
        return new CustomerDTO(current);
    }

    async edit(id, customerData, user) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const customer = await CustomerModel.findOneAndUpdate({ _id: id, user: user._id }, customerData, { new: true });

        if (!customer) {
            throw ApiError.NotFound('Клиент не найден');
        }

        return new CustomerDTO(customer);
    }

    async delete(id, user) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const customer = await this.getCustomerById(id, user);

        const tasks = await TaskService.getTasks(user, { customer: id });

        if (tasks.length > 0) {
            throw ApiError.BadRequest('Невозможно удалить клиента, для которого созданы задачи');
        }

        if (customer) {
            await CustomerModel.findOneAndRemove({
                _id: id,
                user: user._id,
            });
        }
    }
}

module.exports = new CustomerService();
