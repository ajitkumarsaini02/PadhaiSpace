const User = require('../models/User');

// @route GET /api/bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: [
        { path: 'branchId', select: 'name code' },
        { path: 'semesterId', select: 'number' },
        { path: 'subjectId', select: 'name code' },
        { path: 'unitId', select: 'unitNumber title' },
      ],
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user.bookmarks || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/bookmarks/:resourceId
exports.addBookmark = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.bookmarks.includes(resourceId)) {
      user.bookmarks.push(resourceId);
      await user.save();
    }

    res.json({ success: true, message: 'Resource bookmarked', bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/bookmarks/:resourceId
exports.removeBookmark = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.bookmarks = user.bookmarks.filter(
      (bId) => bId.toString() !== resourceId.toString()
    );
    await user.save();

    res.json({ success: true, message: 'Bookmark removed', bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
