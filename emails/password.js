const keys = require('../config');

module.exports = function (email) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Webber CRM - пароль изменён',
        html: `
            <h1>Ваш пароль был изменён.</h1>
            <p>Если вы не меняли пароль, перейдите на страницу сброса пароля: <br>
                <a href="${keys.CLIENT_URL}/auth/reset">Восстановить доступ</a>
            </p>
            <hr />
            <a href="${keys.CLIENT_URL}">Перейти в Webber CRM</a>
        `,
    };
};
