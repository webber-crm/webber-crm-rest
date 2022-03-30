const ApiError = require('../exceptions/api-error');

exports.forbidden = function () {
    throw ApiError.Forbidden();
};

exports.notAllowed = function () {
    throw ApiError.MethodNotAllowed();
};
