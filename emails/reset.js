const keys = require('../config');

module.exports = function (email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Webber CRM - Восстановление пароля',
        html: `
            <h1>Восстановление пароля Webber CRM</h1>
            <p>Если вы не хотели восстановить пароль, проигнорируйте это сообщение.</p>
            <p>Для восстановления пароля нажмите на ссылку ниже (действует 10 минут):</p>
            <p><a href="${keys.CLIENT_URL}/auth/new-password/${token}">Восстановить доступ</a></p>
            <hr />
            <a href="${keys.CLIENT_URL}">Перейти в Webber CRM</a>
        `,
    };
};
