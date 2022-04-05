const TaskModel = require('../models/task');

/**
 * Created by ASTAKHOV A.A. on 29.03.2022
 */

class PaginationService {
    async getPagination(Model, content, size, find = {}) {
        const total_elements = await Model.find(find).countDocuments();
        const total_pages = total_elements < size ? 1 : Math.round(total_elements / size);

        return {
            content,
            total_elements,
            total_pages,
        };
    }
}

module.exports = new PaginationService();
