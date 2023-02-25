module.exports = function (email) {
    return {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Аккаунт удалён - Webber CRM',
        html: `
            <h1>Ваш аккаунт Webber CRM был удалён.</h1>
            <p>Если захотите завести аккаунт снова, можете сделать это по ссылке: </p>
            <p><a href="${process.env.CLIENT_URL}/auth/register"></a></p>
            <hr />
            <a href="${process.env.CLIENT_URL}">Webber CRM</a>
        `,
    };
};
