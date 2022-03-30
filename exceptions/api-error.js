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

    static BadRequest(message = 'Bad Request', errors = []) {
        return new ApiError(400, message, errors);
    }

    static Forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    static NotFound(message = 'Not Found') {
        return new ApiError(404, message);
    }

    static MethodNotAllowed(message = 'Method not allowed') {
        return new ApiError(405, message);
    }
};
