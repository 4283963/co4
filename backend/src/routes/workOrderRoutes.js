const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');

router.get('/', workOrderController.getAllOrders);
router.get('/:id', workOrderController.getOrderById);
router.put('/:id/status', workOrderController.updateOrderStatus);

module.exports = router;
