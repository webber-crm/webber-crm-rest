module.exports = function (req, res) {
    return res.status(403).json({ msg: 'Доступ запрещён' });
};
