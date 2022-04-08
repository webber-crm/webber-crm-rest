/**
 * Created by ASTAKHOV A.A. on 30.03.2022
 */

const { validationResult } = require('express-validator');
const StatusService = require('../../service/directory/status-service');
const ApiError = require('../../exceptions/api-error');

class StatusController {
    async getStatus(req, res, next) {
        try {
            const { id } = req.params;
            const status = await StatusService.getStatusById(id);

            res.json(status);
        } catch (e) {
            next(e);
        }
    }

    async getAllStatuses(req, res, next) {
        try {
            const { page, size, ordering, ...filter } = req.params;
            const status = await StatusService.getAllStatuses(page, size, ordering, filter);
            return res.json(status);
        } catch (e) {
            next(e);
        }
    }

    async create(req, res, next) {
        try {
            const errors = validationResult(req); // получаем ошибки валдации (если есть)
            if (!errors.isEmpty()) {
                // если переменная с ошибками не пуста
                return next(ApiError.BadRequest(errors.array()[0].msg));
            }

            const status = await StatusService.create(req.body);
            res.status(201).json(status);
        } catch (e) {
            next(e);
        }
    }

    async edit(req, res, next) {
        try {
            const { id } = req.params;
            const { body } = req;

            const errors = validationResult(body); // получаем ошибки валидации (если есть)
            if (!errors.isEmpty()) {
                // если переменная с ошибками не пуста
                return next(ApiError.BadRequest(errors.array()[0].msg));
            }

            const status = await StatusService.edit(id, body);
            res.json(status);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            await StatusService.delete(req.params.id);
            res.status(204).json();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new StatusController();
