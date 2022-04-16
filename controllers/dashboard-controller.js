/**
 * Created by ASTAKHOV A.A. on 27.03.2022
 */

const DashboardService = require('../service/dashboard-service');

class DashboardController {
    async getHomeTasks(req, res, next) {
        try {
            const cards = await DashboardService.getHomeTasks(req.user);
            res.json(cards);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new DashboardController();
