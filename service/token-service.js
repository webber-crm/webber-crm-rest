const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require('../config');
const Token = require('../models/token');

class TokenService {
    static generateTokens(payload) {
        const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });

        return {
            accessToken,
            refreshToken,
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

    static async saveToken(userId, refreshToken) {
        const tokenData = await Token.findOne({ user: userId });

        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }

        return Token.create({
            user: userId,
            refreshToken,
        });
    }

    static async removeToken(refreshToken) {
        return Token.deleteOne({ refreshToken });
    }

    static async findToken(refreshToken) {
        return Token.findOne({ refreshToken });
    }
}

module.exports = TokenService;
