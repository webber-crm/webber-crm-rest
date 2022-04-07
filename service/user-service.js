const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { isValidObjectId } = require('mongoose');
const UserModel = require('../models/user');
const RoleModel = require('../models/role');
const TokenService = require('./token-service');
const UserDTO = require('../dto/user');
const ApiError = require('../exceptions/api-error');
const keys = require('../config');
const activationEmail = require('../emails/activation');
const passwordEmail = require('../emails/password');
const resetEmail = require('../emails/reset');
const registerEmail = require('../emails/registration');

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
        const hashPassword = await bcrypt.hash(password, 10);
        const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

        const roleByDefault = await RoleModel.findOne({ role: 'USER' });

        const user = await UserModel.create({ email, password: hashPassword, role: roleByDefault._id, activationLink });
        await transporter.sendMail(
            activationEmail(email, `${keys.API_URL}${keys.PREFIX}/auth/activate/${activationLink}`),
        );

        const populated = await UserModel.findById(user.id).populate('role');

        const userDTO = new UserDTO(populated); // id, email, is_active
        const tokens = TokenService.generateTokens({ ...userDTO });
        await TokenService.saveToken(userDTO.id, tokens.refreshToken);

        return { ...tokens, user: userDTO };
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink });
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации');
        }
        user.is_active = true;
        user.activationLink = undefined;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({ email }).populate('role');
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
        const { name, email, password } = userData;

        /*
            создаём хэш пароля
         */
        const hashPassword = await bcrypt.hash(password, 10);

        const roleByDefault = await RoleModel.findOne({ role: 'USER' });

        const user = new UserModel({ ...userData, password: hashPassword, role: roleByDefault._id });
        const current = await user.save();

        /*
            отправляем письмо через метод sendMail() у transporter
            отправку письма рекомендуется делать после редиректов, чтобы не наблюдать задержек
         */
        await transporter.sendMail(registerEmail(email, name.first));

        return new UserDTO(current);
    }

    async edit(id, userData) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const current = await UserModel.findByIdAndUpdate(id, userData, { new: true });
        return new UserDTO(current);
    }

    async delete(id) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        return UserModel.findByIdAndDelete(id);
    }

    async resetPassword(email) {
        crypto.randomBytes(32, async (err, buffer) => {
            const token = buffer.toString('hex');
            const candidate = await UserModel.findOne({ email });

            if (!candidate) {
                throw ApiError.BadRequest('Такого пользователя не существует');
            }

            candidate.reset.token = token;
            candidate.reset.expires = Date.now() + 60 * 10 * 1000; // задаём время жизни токена в мс (60 сек * 60 минут * 1000)
            const current = await candidate.save();

            await transporter.sendMail(resetEmail(candidate.email, token));
            return new UserDTO(current);
        });
    }

    async newPassword(token, password) {
        const user = await UserModel.findOne({
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

        return new UserDTO(current);
    }

    async changePassword(userId, password) {
        const user = await this.getUserById(userId);
        user.password = await bcrypt.hash(password, 10); // шифрование пароля

        const current = await user.save(); // сохраняем пользователя
        return new UserDTO(current);
    }

    async getAllUsers() {
        return UserModel.find().populate('role');
    }

    async getUser(field, value) {
        return UserModel.findOne({ [field]: value }).populate('role');
    }

    async getUserById(id) {
        if (!isValidObjectId(id)) {
            throw ApiError.BadRequest('Неправильный формат id');
        }

        const user = await UserModel.findById(id).populate('role');

        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден');
        }

        return user;
    }
}

module.exports = new UserService();
