/**
 * Created by ASTAKHOV A.A. on 28.03.2022
 */

const { v4 } = require('uuid');

class RandomService {
    randomName(length = 5) {
        return Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, '')
            .substr(0, length);
    }

    randomNum(max = 100) {
        return Math.floor(Math.random() * max);
    }

    randomData(length = 5) {
        return Array.from({ length }, () => ({
            id: v4(),
            name: this.randomName(),
            count: this.randomNum(),
        }));
    }
}

module.exports = new RandomService();
