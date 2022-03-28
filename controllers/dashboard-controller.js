/**
 * Created by ASTAKHOV A.A. on 27.03.2022
 */

const RandomService = require('../service/random-service');

class DashboardController {
    async getHomeCards(req, res, next) {
        try {
            const cards = RandomService.randomData();
            res.json(cards);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new DashboardController();
