const TokenService = require('../utils/token-service');

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(400).json({ msg: 'Отсутствует заголовок Authorization' });
    }

    const access_token = authHeader.split(' ')[1];

    if (!access_token) {
        return res.status(401).json({ msg: 'Требуется авторизация' });
    }

    const userData = TokenService.validateAccessToken(access_token);
    if (!userData) {
        return res.status(401).json({ msg: 'Требуется авторизация' });
    }

    req.user = userData;

    next();
};
