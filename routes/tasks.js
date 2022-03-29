const { Router } = require('express'); // аналог const express.Router = require('express')

const authMiddleware = require('../middleware/auth');

const TaskController = require('../controllers/task-controller');

const { taskValidators, taskValidatorsEdit } = require('../utils/validators');

const router = Router();

router.get('/', authMiddleware, TaskController.getTasks);

router.post('/', authMiddleware, taskValidators, TaskController.create);

router.get('/:id', authMiddleware, TaskController.getTask);

router.patch('/:id', authMiddleware, taskValidatorsEdit, TaskController.edit);

router.delete('/:id', authMiddleware, TaskController.delete);

module.exports = router;
