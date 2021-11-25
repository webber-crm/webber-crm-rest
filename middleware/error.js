/*
    создали middleware
*/

module.exports = function(req, res, next) {
    res.status(404).json({msg: 'Страница не найдена',})
    // здесь не используем функицию next()
}