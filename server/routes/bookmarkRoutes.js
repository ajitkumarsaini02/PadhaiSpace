const express = require('express');
const router = express.Router();
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getBookmarks);
router.post('/:resourceId', protect, addBookmark);
router.delete('/:resourceId', protect, removeBookmark);

module.exports = router;
