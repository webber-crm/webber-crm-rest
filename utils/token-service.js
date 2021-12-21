const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require('../config');
const Token = require('../models/tokens');

class TokenService {
    static generateTokens(payload) {
        const access_token = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '30m' });
        const refresh_token = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });

        return {
            access_token,
            refresh_token,
        };
    }

    static validateAccessToken(token) {
        try {
            return jwt.verify(token, JWT_ACCESS_SECRET);
        } catch (e) {
            return null;
        }
    }

    static validateRefreshToken(token) {
        try {
            return jwt.verify(token, JWT_REFRESH_SECRET);
        } catch (e) {
            return null;
        }
    }

    static async saveTokens(userId, refresh_token) {
        const tokenData = await Token.findOne({ user: userId });

        if (tokenData) {
            tokenData.refresh_token = refresh_token;
            return tokenData.save();
        }

        return Token.create({
            user: userId,
            refresh_token,
        });
    }

    static async removeToken(refresh_token) {
        return Token.deleteOne({ refresh_token });
    }

    static async findToken(refresh_token) {
        return Token.findOne({ refresh_token });
    }
}

module.exports = TokenService;
