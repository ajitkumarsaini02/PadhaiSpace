const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Resource = require('../models/Resource');
const connectDB = require('../config/db');

const SAMPLE_PDF_URL = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf";

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Connected to database. Bootstrapping PadhaiSpace Subject -> Unit -> Resource architecture...');

    const masterSubjectsData = [
      { name: 'Data Structure', code: 'BCS301', desc: 'Arrays, Linked Lists, Stacks, Queues, Trees, BST, Graphs, Sorting & Hashing Algorithms' },
      { name: 'Computer Organization and Architecture', code: 'BCS302', desc: 'ALU Design, Instruction Pipeline, Pipelining, Cache Memory, and I/O Interfacing' },
      { name: 'Discrete Structures & Theory of Logic', code: 'BCS303', desc: 'Set Theory, Propositional Logic, Graph Theory, Combinatorics, and Group Theory' },
      { name: 'Operating System', code: 'BCS401', desc: 'Processes, CPU Scheduling, Synchronization, Deadlocks, Memory Paging, and File Systems' },
      { name: 'Theory of Automata and Formal Languages', code: 'BCS402', desc: 'DFA, NFA, Regular Expressions, Context-Free Grammars, Pushdown Automata & Turing Machines' },
      { name: 'Object Oriented Programming with Java', code: 'BCS403', desc: 'Java OOPs, Classes, Inheritance, Interfaces, Multithreading, Exception Handling & Collections' },
      { name: 'Database Management System', code: 'BCS501', desc: 'ER Diagrams, Relational Algebra, SQL Queries, Normalization, ACID Transactions & Indexing' },
      { name: 'Web Technology', code: 'BCS502', desc: 'Client-Server Architecture, JavaScript ES6+, Node.js, Express.js, REST APIs & Web Security' },
      { name: 'Design and Analysis of Algorithm', code: 'BCS503', desc: 'Asymptotic Analysis, Divide & Conquer, Greedy Algorithms, Dynamic Programming, NP-Completeness' },
      { name: 'Software Engineering', code: 'BCS601', desc: 'SDLC Models, Requirements Engineering, UML Modeling, Software Testing, Agile & DevOps' },
      { name: 'Compiler Design', code: 'BCS602', desc: 'Lexical Analysis, Flex/Bison, Syntax Directed Translation, Code Generation & Optimization' },
      { name: 'Computer Networks', code: 'BCS603', desc: 'OSI vs TCP/IP Architecture, Data Link Protocol, IPv4/v6 Addressing, Routing & Transport TCP/UDP' },
      { name: 'Artificial Intelligence', code: 'BCS701', desc: 'State Space Search (A*, Minimax), Constraint Satisfaction, First-Order Logic, Expert Systems' },
      { name: 'Deep Learning', code: 'BAI601', desc: 'Convolutional Neural Networks (CNN), Recurrent Networks (RNN, LSTM), Transformers & PyTorch' },
      { name: 'Big Data Analytics', code: 'BDS601', desc: 'HDFS, Apache Spark DataFrames, PySpark, Distributed Graph Processing, NoSQL Databases' },
    ];

    console.log('[Seeder] Upserting Master Subjects...');
    const canonicalSubjectMap = {};
    for (const sub of masterSubjectsData) {
      const subjectDoc = await Subject.findOneAndUpdate(
        { code: sub.code },
        {
          name: sub.name,
          code: sub.code,
          description: sub.desc,
        },
        { upsert: true, new: true }
      );
      canonicalSubjectMap[sub.code] = subjectDoc;
    }

    console.log(`[Seeder] Seeded ${Object.keys(canonicalSubjectMap).length} Master Subjects.`);

    // Seed Units for Core Subjects
    let totalUnits = 0;
    for (const [code, subjDoc] of Object.entries(canonicalSubjectMap)) {
      const unitsData = [
        { unitNumber: 1, title: `${subjDoc.name} Unit 1: Foundations & Architecture`, description: `Fundamental concepts and core principles of ${subjDoc.name}.` },
        { unitNumber: 2, title: `${subjDoc.name} Unit 2: Algorithmic Formulations`, description: `Mathematical models, structural design, and processing paradigms.` },
        { unitNumber: 3, title: `${subjDoc.name} Unit 3: System Optimization & Control`, description: `Detailed algorithmic strategies, optimization techniques, and implementations.` },
        { unitNumber: 4, title: `${subjDoc.name} Unit 4: Protocols & Security Patterns`, description: `Design patterns, interface standards, protocols, and security considerations.` },
        { unitNumber: 5, title: `${subjDoc.name} Unit 5: Industrial Applications`, description: `Real-world engineering applications and industry benchmarks.` },
      ];

      for (const u of unitsData) {
        await Unit.findOneAndUpdate(
          { subjectId: subjDoc._id, unitNumber: u.unitNumber },
          { subjectId: subjDoc._id, unitNumber: u.unitNumber, title: u.title, description: u.description },
          { upsert: true, new: true }
        );
        totalUnits++;
      }
    }
    console.log(`[Seeder] Seeded ${totalUnits} Units.`);

    // Seed Resources
    const sampleResources = [
      {
        title: 'Data Structure Unit 1 Complete Lecture Notes',
        desc: 'Comprehensive handwritten & digital notes covering Arrays, Stacks, Queues.',
        type: 'notes',
        subjectCode: 'BCS301',
        unitNum: 1,
        academicYear: '2nd Year',
        fileUrl: SAMPLE_PDF_URL,
        tags: ['Data Structures', 'Notes', 'AKTU', 'Unit 1'],
      },
      {
        title: 'Operating System End-Semester PYQ Paper 2024',
        desc: '2024 End Semester question paper with verified solution keys.',
        type: 'pyq',
        subjectCode: 'BCS401',
        unitNum: null,
        academicYear: '2nd Year',
        paperYear: 2024,
        fileUrl: SAMPLE_PDF_URL,
        tags: ['PYQ', 'Operating Systems', '2024'],
      },
      {
        title: 'DBMS Unit 1 ER Diagrams & Relational Model PDF',
        desc: 'Study guide detailing Entity-Relationship mapping and relational algebra.',
        type: 'pdf',
        subjectCode: 'BCS501',
        unitNum: 1,
        academicYear: '3rd Year',
        fileUrl: SAMPLE_PDF_URL,
        tags: ['DBMS', 'ER Model', 'Relational Algebra'],
      },
      {
        title: 'Deep Learning CNN & PyTorch Architecture Notes',
        desc: 'Study guide for Convolutional Neural Networks and PyTorch model training.',
        type: 'notes',
        subjectCode: 'BAI601',
        unitNum: 1,
        academicYear: '3rd Year',
        fileUrl: SAMPLE_PDF_URL,
        tags: ['Deep Learning', 'PyTorch', 'CNN'],
      },
      {
        title: 'Big Data Analytics PySpark & HDFS Lab Manual',
        desc: 'Lab manual detailing PySpark RDDs, DataFrames and HDFS setup.',
        type: 'notes',
        subjectCode: 'BDS601',
        unitNum: 1,
        academicYear: '3rd Year',
        fileUrl: SAMPLE_PDF_URL,
        tags: ['Big Data', 'PySpark', 'HDFS'],
      }
    ];

    let totalRes = 0;
    for (const r of sampleResources) {
      const subj = canonicalSubjectMap[r.subjectCode];
      if (subj) {
        let unitId = null;
        if (r.unitNum) {
          const uDoc = await Unit.findOne({ subjectId: subj._id, unitNumber: r.unitNum });
          if (uDoc) unitId = uDoc._id;
        }

        await Resource.findOneAndUpdate(
          { title: r.title, subjectId: subj._id },
          {
            title: r.title,
            description: r.desc,
            type: r.type,
            subjectId: subj._id,
            unitId,
            academicYear: r.academicYear || '',
            paperYear: r.paperYear || null,
            fileUrl: r.fileUrl,
            externalUrl: r.fileUrl,
            tags: r.tags,
          },
          { upsert: true, new: true }
        );
        totalRes++;
      }
    }
    console.log(`[Seeder] Seeded ${totalRes} Academic Resources.`);

    console.log('=============================================================================');
    console.log('[Seeder] PadhaiSpace Core Academic Seeding Completed Cleanly!');
    console.log('=============================================================================');

    if (require.main === module) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('[Seeder Error] Seeding failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

