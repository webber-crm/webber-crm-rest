module.exports = function (email, token) {
    return {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Webber CRM - Восстановление пароля',
        html: `
            <h1>Восстановление пароля Webber CRM</h1>
            <p>Если вы не хотели восстановить пароль, проигнорируйте это сообщение.</p>
            <p>Для восстановления пароля нажмите на ссылку ниже (действует 10 минут):</p>
            <p><a href="${process.env.CLIENT_URL}/new-password/${token}">Восстановить доступ</a></p>
            <hr />
            <a href="${process.env.CLIENT_URL}">Перейти в Webber CRM</a>
        `,
    };
};
