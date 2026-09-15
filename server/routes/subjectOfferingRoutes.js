const express = require('express');
const router = express.Router();
const {
  getSubjectOfferings,
  createSubjectOffering,
  updateSubjectOffering,
  deleteSubjectOffering,
} = require('../controllers/subjectOfferingController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getSubjectOfferings);
router.post('/', protect, adminOnly, createSubjectOffering);
router.put('/:id', protect, adminOnly, updateSubjectOffering);
router.delete('/:id', protect, adminOnly, deleteSubjectOffering);

module.exports = router;
