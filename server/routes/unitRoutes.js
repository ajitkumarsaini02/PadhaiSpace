const express = require('express');
const router = express.Router();
const { getUnits, createUnit, updateUnit, deleteUnit } = require('../controllers/unitController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getUnits);
router.post('/', protect, adminOnly, createUnit);
router.put('/:id', protect, adminOnly, updateUnit);
router.delete('/:id', protect, adminOnly, deleteUnit);

module.exports = router;
