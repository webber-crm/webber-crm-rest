const { Router } = require('express'); // аналог const express.Router = require('express')
const CustomerController = require('../controllers/customer-controller');

const router = Router();
const authMiddleware = require('../middleware/auth');

const { customersValidators } = require('../utils/validators');

router.get('/', authMiddleware, CustomerController.getCustomers);

router.post('/', authMiddleware, customersValidators, CustomerController.create);

router.get('/:id', authMiddleware, CustomerController.getCustomer);

router.patch('/:id', authMiddleware, CustomerController.edit);

router.delete('/:id', authMiddleware, CustomerController.delete);

module.exports = router;
