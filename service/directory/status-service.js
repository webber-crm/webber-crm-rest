/**
 * Created by ASTAKHOV A.A. on 30.03.2022
 */

const { isValidObjectId } = require('mongoose');
const ApiError = require('../../exceptions/api-error');
const StatusDTO = require('../../dto/status');
const StatusModel = require('../../models/directory/status');
const PaginationService = require('../pagination-service');

class StatusService {
    async getAllStatuses(page = 0, size = 10, ordering = '-createdAt', filter = {}) {
        const statuses = await StatusModel.find(filter)
            .limit(+page)
            .skip(size * page)
            .sort(ordering)
            .exec();

        const dto = statuses.map(status => new StatusDTO(status));

        const pagination = await PaginationService.getPagination(StatusModel, dto);

        return pagination;
    }

    async getStatusById(id) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const status = await StatusModel.findById(id);

        if (!status) {
            throw ApiError.NotFound('Статус не найден');
        }

        return status;
    }

    async create(statusData) {
        const status = new StatusModel(statusData);
        const current = await status.save(); // вызываем метод класса Task для сохранения в БД
        return current;
    }

    async edit(id, statusData) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const status = await StatusModel.findByIdAndUpdate(id, statusData, { new: true });

        if (!status) {
            throw ApiError.NotFound('Статус не найден');
        }

        return status;
    }

    async delete(id) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        await StatusModel.findByIdAndRemove(id);
    }
}

module.exports = new StatusService();
