const express = require('express');
const router = express.Router();
const { getSemesters, createSemester, updateSemester, deleteSemester } = require('../controllers/semesterController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getSemesters);
router.post('/', protect, adminOnly, createSemester);
router.put('/:id', protect, adminOnly, updateSemester);
router.delete('/:id', protect, adminOnly, deleteSemester);

module.exports = router;
