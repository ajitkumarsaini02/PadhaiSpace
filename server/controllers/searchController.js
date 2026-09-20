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
    const terms = cleanQ.split(/\s+/).filter(Boolean);
    const termRegexes = terms.map((t) => new RegExp(escapeRegex(t), 'i'));

    const subjectFilter = {
      $and: termRegexes.map((tReg) => ({
        $or: [{ name: tReg }, { code: tReg }, { description: tReg }],
      })),
    };

    const unitFilter = {
      $and: termRegexes.map((tReg) => ({
        $or: [{ title: tReg }, { description: tReg }],
      })),
    };

    const resourceFilter = {
      $and: termRegexes.map((tReg) => ({
        $or: [{ title: tReg }, { description: tReg }, { tags: tReg }, { source: tReg }, { academicYear: tReg }],
      })),
    };

    const [subjects, units, allResources] = await Promise.all([
      Subject.find(subjectFilter).limit(15),

      Unit.find(unitFilter)
        .populate('subjectId', 'name code')
        .limit(15),

      Resource.find(resourceFilter)
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

