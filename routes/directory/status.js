const { Router } = require('express'); // аналог const express.Router = require('express')

const router = Router();
const authMiddleware = require('../../middleware/auth');
const StatusController = require('../../controllers/directory/status-controller');

router.get('/', authMiddleware, StatusController.getAllStatuses);
router.post('/', authMiddleware, StatusController.create);

router.get('/:id', authMiddleware, StatusController.getStatus);

router.patch('/:id', authMiddleware, StatusController.edit);

router.delete('/:id', authMiddleware, StatusController.delete);

module.exports = router;
