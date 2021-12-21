const TokenService = require('../utils/token-service');

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(400).json({ msg: 'Отсутствует заголовок Authorization' });
    }

    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ msg: 'Требуется авторизация' });
    }

    const userData = TokenService.validateAccessToken(accessToken);
    if (!userData) {
        return res.status(401).json({ msg: 'Требуется авторизация' });
    }

    req.user = userData;

    next();
};
