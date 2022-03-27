/**
 * Created by ASTAKHOV A.A. on 27.03.2022
 */

const { v4 } = require('uuid');

class DashboardController {
    async getHomeCards(req, res, next) {
        try {
            const randomName = () =>
                Math.random()
                    .toString(36)
                    .replace(/[^a-z]+/g, '')
                    .substr(0, 5);

            const cardData = Array.from({ length: 5 }, () => ({
                id: v4(),
                name: randomName(),
                badge: Math.floor(Math.random() * 100),
            }));

            res.json(cardData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new DashboardController();
