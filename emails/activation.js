// экспортируем функцию, в которой всё стандартно, кроме email-адреса получателя

module.exports = function (email, link) {
    return {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Webber CRM - Активация аккаунта',
        html: `
            <h1>Добро пожаловть в Webber CRM!</h1>
            <hr />
            <p>Для активации аккаунта перейдите по ссылке:</p>
            <a href="${link}">${link}</a>
        `,
    };
};
