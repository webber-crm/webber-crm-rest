/**
 * Created by ASTAKHOV A.A. on 26.03.2022
 */

module.exports = class ApiError extends Error {
    status;

    errors;

    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError() {
        return new ApiError(401, 'Пользователь не авторизован');
    }

    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }
};
