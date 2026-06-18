const express = require('express');
const router = express.Router();
const trashBinController = require('../controllers/trashBinController');

router.get('/', trashBinController.getAllBins);
router.get('/location/:locationId', trashBinController.getBinsByLocation);
router.put('/:id/fill-level', trashBinController.updateFillLevel);
router.put('/:id/empty', trashBinController.emptyBin);

module.exports = router;
