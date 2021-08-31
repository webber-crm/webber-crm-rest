// экспортируем функцию, в которой всё стандартно, кроме email-адреса получателя

const keys = require('../config')

module.exports = function (email, name) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Webber CRM - Аккаунт создан',
        html: `
            <h1>Добро пожаловать в Webber CRM!</h1>
            <p>${name}, вы успешно создали аккаунт.</p>
            <p>Ваш E-mail в системе: ${email}</p>
            <hr />
            <a href="${keys.BASE_URL}">Перейти в систему</a>
        `
    }
}