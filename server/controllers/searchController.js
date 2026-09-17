const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Resource = require('../models/Resource');

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @route GET /api/search?q=...
exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({
        success: true,
        query: '',
        subjects: [],
        units: [],
        notes: [],
        pyqs: [],
        resources: [],
        counts: { subjects: 0, units: 0, notes: 0, pyqs: 0, resources: 0, total: 0 },
      });
    }

    const cleanQ = q.trim();
    const regex = new RegExp(escapeRegex(cleanQ), 'i');

    const [subjects, units, allResources] = await Promise.all([
      Subject.find({
        $or: [{ name: regex }, { code: regex }, { description: regex }],
      }).limit(15),

      Unit.find({
        $or: [{ title: regex }, { description: regex }],
      })
        .populate('subjectId', 'name code')
        .limit(15),

      Resource.find({
        $or: [{ title: regex }, { description: regex }, { tags: regex }, { source: regex }],
      })
        .populate('subjectId', 'name code')
        .populate('unitId', 'unitNumber title')
        .limit(40),
    ]);

    const notes = allResources.filter((r) => ['notes', 'pdf', 'unit-pdf', 'Unit PDF'].includes(r.type));
    const pyqs = allResources.filter((r) => r.type === 'pyq');
    const generalResources = allResources.filter(
      (r) => !['notes', 'pdf', 'unit-pdf', 'Unit PDF', 'pyq'].includes(r.type)
    );

    res.json({
      success: true,
      query: cleanQ,
      subjects,
      units,
      notes,
      pyqs,
      resources: generalResources,
      counts: {
        subjects: subjects.length,
        units: units.length,
        notes: notes.length,
        pyqs: pyqs.length,
        resources: generalResources.length,
        total: subjects.length + units.length + allResources.length,
      },
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

