const ApiError = require('../exceptions/api-error');

module.exports = function (err, req, res) {
    console.log(err);
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message, errors: err.errors });
    }
    return res.status(500).json({ message: 'Непредвиденная ошибка' });
};

module.exports = function (req, res) {
    res.status(404).json({ msg: 'Страница не найдена' });
    // здесь не используем функицию next()
};
