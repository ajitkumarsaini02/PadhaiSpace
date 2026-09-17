const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Subject = require('./models/Subject');
const Unit = require('./models/Unit');
const Resource = require('./models/Resource');

async function testSearchResourceSubject() {
  console.log('=============================================================================');
  console.log('    TESTING SEARCH, RESOURCES, AND SUBJECT ARCHITECTURE WITH MONGODB        ');
  console.log('=============================================================================\n');

  await connectDB();

  const searchController = require('./controllers/searchController');
  const subjectController = require('./controllers/subjectController');
  const resourceController = require('./controllers/resourceController');

  // Helper mock req/res
  const makeReqRes = (query = {}, params = {}) => {
    const req = { query, params };
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      },
    };
    return { req, res };
  };

  // 1. TEST SEARCH ENDPOINT WITH REGEX CHARACTERS AND DBMS QUERY
  console.log('Step 1: Testing Search API (GET /api/search?q=dbms)...');
  const dbmsSearch = makeReqRes({ q: 'dbms' });
  await searchController.globalSearch(dbmsSearch.req, dbmsSearch.res);

  if (dbmsSearch.res.statusCode !== 200) {
    throw new Error(`Search failed with status ${dbmsSearch.res.statusCode}`);
  }
  const searchResult = dbmsSearch.res.jsonData;
  console.log('   Search Results Summary:', {
    query: searchResult.query,
    subjectsCount: searchResult.counts.subjects,
    unitsCount: searchResult.counts.units,
    notesCount: searchResult.counts.notes,
    pyqsCount: searchResult.counts.pyqs,
    resourcesCount: searchResult.counts.resources,
    totalCount: searchResult.counts.total,
  });

  if (searchResult.counts.total === 0) {
    throw new Error('Search for "dbms" returned 0 items from database!');
  }
  console.log('   ✓ PASS: Global search returned real MongoDB data.');

  // Test special character safety (regex injection test)
  console.log('\nStep 2: Testing Safe Regex Character Escaping (q="c++ (dbms) *")...');
  const safeSearch = makeReqRes({ q: 'c++ (dbms) *' });
  await searchController.globalSearch(safeSearch.req, safeSearch.res);
  if (safeSearch.res.statusCode !== 200) {
    throw new Error('Safe search with special regex characters failed!');
  }
  console.log('   ✓ PASS: Special regex characters handled safely without crashing MongoDB query.');

  // 2. TEST SUBJECT DETAIL & MONGO COUNTING
  console.log('\nStep 3: Testing Subject Detail API (GET /api/subjects/:id)...');
  const sampleSubject = await Subject.findOne({ code: 'BCS501' });
  if (!sampleSubject) {
    throw new Error('DBMS subject (BCS501) not found in MongoDB!');
  }

  const subjReqRes = makeReqRes({}, { id: sampleSubject._id.toString() });
  await subjectController.getSubjectById(subjReqRes.req, subjReqRes.res);

  if (subjReqRes.res.statusCode !== 200) {
    throw new Error(`getSubjectById failed with status ${subjReqRes.res.statusCode}`);
  }
  const subjDetail = subjReqRes.res.jsonData.data;
  console.log('   Subject Detail from MongoDB:', {
    name: subjDetail.name,
    code: subjDetail.code,
    unitCount: subjDetail.unitCount,
    resourceCount: subjDetail.resourceCount,
  });

  if (subjDetail.unitCount === undefined || subjDetail.resourceCount === undefined) {
    throw new Error('Subject detail did not return unitCount or resourceCount!');
  }
  console.log('   ✓ PASS: Subject detail returned exact MongoDB unit and resource counts.');

  // 3. TEST RESOURCES CLEAN PARAMETER QUERIES (omitting subjectId=all)
  console.log('\nStep 4: Testing Resources Query without subjectId=all parameter...');
  const resReqRes = makeReqRes({ type: 'notes', page: 1, limit: 12 }); // Omitted subjectId parameter
  await resourceController.getResources(resReqRes.req, resReqRes.res);

  if (resReqRes.res.statusCode !== 200) {
    throw new Error(`getResources failed with status ${resReqRes.res.statusCode}`);
  }
  const resData = resReqRes.res.jsonData;
  console.log(`   Resources Query returned ${resData.count} items (Page ${resData.currentPage} of ${resData.totalPages}).`);
  console.log('   ✓ PASS: Clean resources API query executed cleanly.');

  console.log('\n=============================================================================');
  console.log(' ✓ ALL SEARCH, SUBJECT, AND RESOURCE INTEGRATION TESTS PASSED CLEANLY!       ');
  console.log('=============================================================================\n');

  process.exit(0);
}

testSearchResourceSubject().catch((err) => {
  console.error('\n❌ SEARCH / SUBJECT / RESOURCE TEST FAILED:', err.message);
  process.exit(1);
});
