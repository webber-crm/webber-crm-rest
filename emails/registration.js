// экспортируем функцию, в которой всё стандартно, кроме email-адреса получателя

module.exports = function (email, name) {
    return {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Webber CRM - Аккаунт создан',
        html: `
            <h1>Добро пожаловать в Webber CRM!</h1>
            <p>${name}, вы успешно создали аккаунт.</p>
            <p>Ваш E-mail в системе: ${email}</p>
            <hr />
            <a href="${process.env.CLIENT_URL}">Перейти в систему</a>
        `,
    };
};
