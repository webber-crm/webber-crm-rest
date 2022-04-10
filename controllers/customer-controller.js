/**
 * Created by ASTAKHOV A.A. on 28.03.2022
 */

const { validationResult } = require('express-validator');
const CustomerService = require('../service/customer-service');
const ApiError = require('../exceptions/api-error');
const CustomerDTO = require('../dto/customer');

class CustomerController {
    async getCustomers(req, res, next) {
        try {
            const errors = validationResult(req); // получаем ошибки валдации (если есть)
            if (!errors.isEmpty()) {
                // если переменная с ошибками не пуста
                throw ApiError.BadRequest(errors.array()[0].msg);
            }

            const { page, size, ordering, ...filter } = req.query;
            const { user } = req;

            const tasks = await CustomerService.getAllCustomers(user, page, size, ordering, filter);

            res.json(tasks);
        } catch (e) {
            next(e);
        }
    }

    async getCustomer(req, res, next) {
        try {
            const { id } = req.params;
            const { user } = req;
            const task = await CustomerService.getCustomerById(id, user);
            res.json(new CustomerDTO(task));
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

            const { body, user } = req;

            const task = await CustomerService.create(body, user);
            res.status(201).json(new CustomerDTO(task));
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
            const { body, user } = req;

            const task = await CustomerService.edit(id, body, user);
            res.json(new CustomerDTO(task));
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            await CustomerService.delete(req.params.id, req.user);
            res.status(204).json();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CustomerController();
