// подключаем функцию проверки body из пакета express-validator

const { body } = require('express-validator');

exports.registerValidators = [
    body(['email']).isEmail().withMessage('Введите корректный Email').normalizeEmail(), // санитайзер, нормализует Email
    body('password')
        .isLength({ min: 8, max: 32 })
        .withMessage('Пароль должен быть минимум 8 символов')
        .isAlphanumeric()
        .withMessage('Пароль может включать в себя только буквы и цифры')
        .trim(), // санитайзер trim, удаляет пробелы по краям
];

exports.loginValidators = [
    body('email').if(body('email').isEmail().withMessage('Введите корректный Email').normalizeEmail()),
    body('password', 'Пароль должен быть минимум 8 символов').isLength({ min: 8, max: 32 }).isAlphanumeric().trim(), // санитайзер trim, удаляет пробелы по краям
];

exports.taskValidators = [
    body('title', 'Название и тело задачи должно быть длинее 3 символов').isLength({ min: 3 }).trim(),
    // body(['customer', 'project'], 'Поля "Клиент" и "Проект" обязательны для заполнения').isLength({ min: 1 }).trim(),
];

exports.taskValidatorsEdit = [
    body('title', 'Название задачи должно быть длинее 3 символов').optional().isLength({ min: 3 }).trim(),
    body('estimate', 'Поле оценки задачи должно быть заполнено')
        .optional()
        .isLength({ min: 1 })
        .custom((value, { req }) => {
            if (req.body.role > 1 || !value) {
                throw new Error('Произошла ошибка, попробуйте ещё раз');
            }
            return true;
        }),
];

exports.customersValidators = [
    body('name', 'Наименование не должно быть пустым').isLength({ min: 1 }),
    body('price')
        .isLength({ min: 3 })
        .withMessage('Цена должна быть от 3 символов')
        .isNumeric()
        .withMessage('Цена должна содержать только цифры')
        .trim(),
];

exports.customersValidatorsEdit = [
    body('name').if(body('name')).isLength({ min: 1 }).withMessage('Наименование не должно быть пустым'),
    body('price')
        .if(body('price'))
        .isLength({ min: 3 })
        .withMessage('Цена должна быть от 3 символов')
        .isNumeric()
        .withMessage('Цена должна содержать только цифры')
        .trim(),
];

exports.usersValidators = [
    body('firstname', 'Имя не должно быть пустым').isLength({ min: 1 }).trim(),
    body('email').isEmail().withMessage('Введите корректный Email').normalizeEmail(), // санитайзер, нормализует Email
];
