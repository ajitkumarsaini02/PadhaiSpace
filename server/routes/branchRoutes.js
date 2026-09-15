const express = require('express');
const router = express.Router();
const { getBranches, createBranch, updateBranch, deleteBranch } = require('../controllers/branchController');
const { getSubjects } = require('../controllers/subjectController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getBranches);
router.get('/:branchId/subjects', getSubjects);
router.get('/:branchId/semesters/:semesterId/subjects', getSubjects);
router.post('/', protect, adminOnly, createBranch);
router.put('/:id', protect, adminOnly, updateBranch);
router.delete('/:id', protect, adminOnly, deleteBranch);

module.exports = router;
