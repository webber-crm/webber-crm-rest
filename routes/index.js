/**
 * Created by ASTAKHOV A.A. on 26.03.2022
 */

const express = require('express');

const { Router } = express;

const mainRoutes = require('./main');
const authRoutes = require('./auth');
const tasksRoutes = require('./tasks');
const rolesRoutes = require('./roles');
const usersRoutes = require('./users');
const projectsRoutes = require('./projects');
const customersRoutes = require('./customers');

const router = Router();

/*
    регистрируем роуты router.use()
    1 параметр - префикс (путь)
    2 параметр - переменная с подключенным роутом
 */
router.use('/', mainRoutes);

router.use('/auth', authRoutes);
router.use('/tasks', tasksRoutes);

router.use('/users/roles', rolesRoutes);
router.use('/users', usersRoutes);

router.use('/customers/projects', projectsRoutes);
router.use('/customers', customersRoutes);

module.exports = router;
