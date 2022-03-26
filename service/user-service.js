const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const UserModel = require('../models/user');
const TokenService = require('./token-service');
const UserDTO = require('../dto/user');
const ApiError = require('../exceptions/api-error');
const keys = require('../config');
const activationEmail = require('../emails/activation');
const passwordEmail = require('../emails/password');
const resetEmail = require('../emails/reset');
const registerEmail = require('../emails/registration');
const User = require('../models/user');

/*
    создаём transporter для sendgrid

    в метод createTransport передаём функцию из пакета "nodemailer-sendgrid-transport"
    внутри функции sendrid передаём объект конфигурации
 */
const transporter = nodemailer.createTransport(
    sendgrid({
        auth: {
            api_key: keys.SENDGRID_API_KEY, // передаём ключ API, полученный в Sendgrid
        },
    }),
);

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

        const user = await UserModel.create({ email, password: hashPassword, activationLink });
        await transporter.sendMail(activationEmail(email, `${keys.API_URL}/api/activate/${activationLink}`));

        const userDTO = new UserDTO(user); // id, email, isActivated
        const tokens = TokenService.generateTokens({ ...userDTO });
        await TokenService.saveToken(userDTO.id, tokens.refreshToken);

        return { ...tokens, user: userDTO };
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink });
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации');
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден');
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDTO = new UserDTO(user);
        const tokens = TokenService.generateTokens({ ...userDTO });

        await TokenService.saveToken(userDTO.id, tokens.refreshToken);
        return { ...tokens, user: userDTO };
    }

    async logout(refreshToken) {
        const token = await TokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await TokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDTO = new UserDTO(user);
        const tokens = TokenService.generateTokens({ ...userDTO });

        await TokenService.saveToken(userDTO.id, tokens.refreshToken);
        return { ...tokens, user: userDTO };
    }

    async create(userData) {
        const errors = validationResult(userData); // получаем ошибки валдации (если есть)
        if (!errors.isEmpty()) {
            // если переменная с ошибками не пуста
            throw ApiError.BadRequest(errors.array()[0].msg);
        }

        const { name, email, password } = userData;

        /*
            создаём хэш пароля
         */
        const hashPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({ ...userData, password: hashPassword });
        const current = await user.save();

        /*
            отправляем письмо через метод sendMail() у transporter
            отправку письма рекомендуется делать после редиректов, чтобы не наблюдать задержек
         */
        await transporter.sendMail(registerEmail(email, name.first));

        return current;
    }

    async edit(id, userData) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const errors = validationResult(userData); // получаем ошибки валдации (если есть)
        if (!errors.isEmpty()) {
            // если переменная с ошибками не пуста
            throw ApiError.BadRequest(errors.array()[0].msg);
        }

        const current = await User.findByIdAndUpdate(id, userData, { new: true });
        return current;
    }

    async delete(id) {
        return UserModel.findByIdAndDelete(id);
    }

    async resetPassword(email) {
        crypto.randomBytes(32, async (err, buffer) => {
            const token = buffer.toString('hex');
            const candidate = await User.findOne({ email });

            if (!candidate) {
                throw ApiError.BadRequest('Такого пользователя не существует');
            }

            candidate.reset.token = token;
            candidate.reset.expires = Date.now() + 60 * 10 * 1000; // задаём время жизни токена в мс (60 сек * 60 минут * 1000)
            const current = await candidate.save();

            await transporter.sendMail(resetEmail(candidate.email, token));
            return current;
        });
    }

    async createNewPassword(userId, token, password) {
        const user = await User.findOne({
            _id: userId,
            'reset.token': token,
            'reset.expires': { $gt: Date.now() },
        });

        if (!user) {
            throw ApiError.BadRequest('Время жизни токена истекло');
        }

        user.password = await bcrypt.hash(password, 10); // шифрование пароля
        user.reset = undefined; // очищаем данные токена

        const current = await user.save(); // сохраняем пользователя
        await transporter.sendMail(passwordEmail(user.email));

        return current;
    }

    async getAllUsers() {
        return UserModel.find();
    }

    async getUser(field, value) {
        return UserModel.findOne({ [field]: value });
    }

    async getUserById(id) {
        return UserModel.findById(id);
    }
}

module.exports = new UserService();