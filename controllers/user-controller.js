/**
 * Created by ASTAKHOV A.A. on 26.03.2022
 */

const { validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const UserService = require('../service/user-service');
const ApiError = require('../exceptions/api-error');
const User = require('../models/user');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req.body);
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
            const errors = validationResult(req.body);
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
            const activationLink = req.params.link;
            await UserService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
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

    async create(req, res, next) {
        try {
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
            const { userId, token, password } = req.body;
            const newPasswordData = await UserService.newPassword(userId, token, password);

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
