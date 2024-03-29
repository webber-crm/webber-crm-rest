/**
 * Created by ASTAKHOV A.A. on 26.03.2022
 */

const { validationResult } = require('express-validator');
const UserService = require('../service/user-service');
const ApiError = require('../exceptions/api-error');
const { CLIENT_URL } = require('../config');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest(errors.array()[0].msg, errors.array()));
            }
            const { email, password } = req.body;
            const userData = await UserService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.status(201).json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest(errors.array()[0].msg, errors.array()));
            }
            const { email, password } = req.body;
            const userData = await UserService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await UserService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const { link } = req.params;
            await UserService.activate(link);
            return res.redirect(CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await UserService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async getUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserById(id);

            res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async getProfile(req, res, next) {
        try {
            const { user } = req;

            if (!user) return null;

            const profile = await UserService.getUserById(user._id);
            return res.json(profile);
        } catch (e) {
            next(e);
        }
    }

    async editProfile(req, res, next) {
        try {
            const { user, body } = req;

            if (!user) return null;

            const profile = await UserService.edit(user._id, body);
            return res.json(profile);
        } catch (e) {
            next(e);
        }
    }

    async create(req, res, next) {
        try {
            const errors = validationResult(req); // получаем ошибки валдации (если есть)
            if (!errors.isEmpty()) {
                // если переменная с ошибками не пуста
                return next(ApiError.BadRequest(errors.array()[0].msg));
            }

            const user = await UserService.create(req.body);
            res.status(201).json(user);
        } catch (e) {
            next(e);
        }
    }

    async edit(req, res, next) {
        try {
            const { id } = req.params;
            const { body } = req;

            const errors = validationResult(body); // получаем ошибки валидации (если есть)
            if (!errors.isEmpty()) {
                // если переменная с ошибками не пуста
                return next(ApiError.BadRequest(errors.array()[0].msg));
            }

            const user = await UserService.edit(id, body);
            res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            await UserService.delete(req.params.id);
            res.status(204).json();
        } catch (e) {
            next(e);
        }
    }

    async resetPassword(req, res, next) {
        /*
        алгоритм сброса пароля:

        1. проверяем, существует ли пользователь
        2. генерируем токен, по которому будем ижентифицировать пользователя, + время жизни токена
        3. заносим данные в базу, модель пользователя
        4. отправляем email
        5. при входе пользователя по ссылке из email сверяем токены
        6. если токены верны, даём сменить пароль
        7. сохраняем новый пароль в базу
     */
        try {
            const { email } = req.body;
            const resetData = await UserService.resetPassword(email);

            res.json(resetData);
        } catch (e) {
            next(e);
        }
    }

    async newPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            const newPasswordData = await UserService.newPassword(token, password);

            res.json(newPasswordData);
        } catch (e) {
            next(e);
        }
    }

    async changePassword(req, res, next) {
        try {
            const { id } = req.params;
            const { password } = req.body;

            const newPasswordData = await UserService.changePassword(id, password);

            res.json(newPasswordData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();
