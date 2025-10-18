const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const algoController = require('../controllers/algoController');

// Get strategy templates
router.get('/templates', protect, algoController.getTemplates);

// CRUD operations
router.post('/', protect, algoController.createAlgorithm);
router.get('/', protect, algoController.getAlgorithms);
router.get('/:id', protect, algoController.getAlgorithm);
router.put('/:id', protect, algoController.updateAlgorithm);
router.delete('/:id', protect, algoController.deleteAlgorithm);

// Backtesting
router.post('/:id/backtest', protect, algoController.backtestAlgorithm);

// Live trading control
router.post('/:id/activate', protect, algoController.activateAlgorithm);
router.post('/:id/stop', protect, algoController.stopAlgorithm);

// Statistics
router.get('/:id/stats', protect, algoController.getAlgorithmStats);

module.exports = router;
