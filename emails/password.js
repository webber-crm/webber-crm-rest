module.exports = function (email) {
    return {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Webber CRM - пароль изменён',
        html: `
            <h1>Ваш пароль был изменён.</h1>
            <p>Если вы не меняли пароль, перейдите на страницу сброса пароля: <br>
                <a href="${process.env.CLIENT_URL}/reset-password">Восстановить доступ</a>
            </p>
            <hr />
            <a href="${process.env.CLIENT_URL}">Перейти в Webber CRM</a>
        `,
    };
};
