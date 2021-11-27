module.exports = function (req, res, next) {
    if (!req.session.isAuthorized) {
        return res.status(401).json({ msg: 'Требуется авторизация' });
    }

    next();
};
