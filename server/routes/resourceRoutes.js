const express = require('express');
const router = express.Router();
const {
  getResources,
  getSources,
  getAcademicYears,
  getPaperYears,
  getPYQSubjects,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  incrementViews,
  viewProtectedPDF,
} = require('../controllers/resourceController');
const { protect, optionalAuth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getResources);
router.get('/meta/sources', getSources);
router.get('/meta/academic-years', getAcademicYears);
router.get('/meta/paper-years', getPaperYears);
router.get('/meta/pyq-subjects', getPYQSubjects);
router.get('/:id', getResourceById);
router.get('/:id/view', protect, viewProtectedPDF);
router.post('/:id/view', incrementViews);

router.post('/', protect, adminOnly, upload.single('file'), createResource);
router.put('/:id', protect, adminOnly, upload.single('file'), updateResource);
router.delete('/:id', protect, adminOnly, deleteResource);

module.exports = router;
