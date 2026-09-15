const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Branch = require('../models/Branch');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const SubjectOffering = require('../models/SubjectOffering');
const Unit = require('../models/Unit');
const Resource = require('../models/Resource');
const connectDB = require('../config/db');

const SAMPLE_PDF_URL = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf";

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Connected to database. Executing Multi-Branch Academic Architecture Seeding...');

    // 1. Canonical Branches: CSE, CSE-AIML, CSE-DS
    const branchesData = [
      {
        name: 'CSE',
        code: 'cse',
        description: 'B.Tech Computer Science & Engineering (CSE)',
        icon: 'Code2',
      },
      {
        name: 'CSE-AIML',
        code: 'cse-aiml',
        description: 'B.Tech CSE (Artificial Intelligence & Machine Learning)',
        icon: 'BrainCircuit',
      },
      {
        name: 'CSE-DS',
        code: 'cse-ds',
        description: 'B.Tech CSE (Data Science)',
        icon: 'Server',
      },
    ];

    const branchMap = {};
    for (const bData of branchesData) {
      const bDoc = await Branch.findOneAndUpdate(
        { code: bData.code },
        bData,
        { upsert: true, new: true }
      );
      branchMap[bDoc.code] = bDoc;
    }

    // Remove any obsolete non-standard branches
    await Branch.deleteMany({ code: { $nin: ['cse', 'cse-aiml', 'cse-ds'] } });

    // 2. Semesters 1 to 8 for CSE, CSE-AIML, CSE-DS
    const semesterMap = {}; // key: "cse-4" => semesterDoc._id
    for (const bCode of ['cse', 'cse-aiml', 'cse-ds']) {
      const bObj = branchMap[bCode];
      for (let semNum = 1; semNum <= 8; semNum++) {
        const semDoc = await Semester.findOneAndUpdate(
          { number: semNum, branchId: bObj._id },
          { number: semNum, branchId: bObj._id },
          { upsert: true, new: true }
        );
        semesterMap[`${bCode}-${semNum}`] = semDoc._id;
      }
    }

    // 3. Complete Master Canonical Subject Dictionary
    const masterSubjectsData = [
      // ================= FIRST YEAR (COMMON FOR ALL BRANCHES) =================
      { name: 'Quantum Physics and Applications', code: '', subjectType: 'theory', credits: 4, desc: 'Quantum Mechanics, Wave Optics, Lasers and Semiconductor Physics' },
      { name: 'Applied Chemistry for Smart Systems', code: '', subjectType: 'theory', credits: 4, desc: 'Water Technology, Electrochemistry, Smart Polymers, and Material Science' },
      { name: 'Calculus and Linear Algebra', code: '', subjectType: 'theory', credits: 4, desc: 'Differential Calculus, Matrices, Eigenvalues, and Infinite Series' },
      { name: 'Numerical Methods', code: '', subjectType: 'theory', credits: 4, desc: 'Interpolation, Numerical Integration, Differential Equations, and Error Analysis' },
      { name: 'Fundamentals of Electrical Engineering', code: '', subjectType: 'theory', credits: 3, desc: 'DC/AC Circuits, Network Theorems, Transformers, and Electrical Machines' },
      { name: 'Fundamentals of Electronics Engineering', code: '', subjectType: 'theory', credits: 3, desc: 'Semiconductor Diodes, BJTs, Op-Amps, and Digital Logic Basics' },
      { name: 'Programming Languages', code: '', subjectType: 'theory', credits: 3, desc: 'Control Structures, Functions, Arrays, Pointers, and Programming Fundamentals' },
      { name: 'Essentials of Data Structure', code: '', subjectType: 'theory', credits: 3, desc: 'Arrays, Linked Lists, Stacks, Queues, Searching, and Sorting Basics' },
      { name: 'Introduction to Indian Knowledge System', code: '', subjectType: 'theory', credits: 2, desc: 'Indian Scientific Tradition, Heritage, Mathematics, and Ancient Knowledge Systems' },
      { name: 'Professional Communication & Technical Writing', code: '', subjectType: 'theory', credits: 2, desc: 'Technical Report Writing, Grammar, Business Correspondence, and Soft Skills' },
      { name: 'Introduction to AI & Prompt Engineering', code: '', subjectType: 'theory', credits: 2, desc: 'Generative AI Foundations, LLMs, Prompt Structuring, and AI Applications' },
      { name: 'Fundamentals of Mechanical Engineering', code: '', subjectType: 'theory', credits: 3, desc: 'Thermodynamics, IC Engines, Statics, Dynamics, and Manufacturing Basics' },
      { name: 'Environment & Sustainability', code: '', subjectType: 'theory', credits: 2, desc: 'Ecosystems, Pollution Control, Renewable Energy, and Environmental Protection' },

      // First Year Labs
      { name: 'Applied Physics Lab', code: '', subjectType: 'lab', credits: 1, desc: 'Optics, Wavelength Determination, and Semiconductor Experiments' },
      { name: 'Applied Chemistry for Smart Systems Lab', code: '', subjectType: 'lab', credits: 1, desc: 'Volumetric Analysis, Hardness of Water, and Viscosity Testing' },
      { name: 'Electrical Engineering Lab', code: '', subjectType: 'lab', credits: 1, desc: 'Verification of Network Theorems and Electrical Machine Characteristics' },
      { name: 'Electronics Engineering Lab', code: '', subjectType: 'lab', credits: 1, desc: 'Diode Rectifiers, Transistor Biasing, and Logic Gate Experiments' },
      { name: 'Computer-Aided Engineering Drawing Lab', code: '', subjectType: 'lab', credits: 1, desc: 'CAD Drafting, Orthographic Projections, and 3D Isometric Models' },
      { name: 'Innovation & Design Thinking Lab', code: '', subjectType: 'lab', credits: 1, desc: 'Prototyping, Empathy Mapping, Idea Generation, and Problem Solving' },
      { name: 'Language Lab', code: '', subjectType: 'lab', credits: 1, desc: 'Phonetics, Listening Comprehension, Group Discussion, and Presentation Labs' },

      // ================= SECOND YEAR (COMMON CS CORE) =================
      { name: 'Data Structure', code: 'BCS301', subjectType: 'theory', credits: 4, desc: 'Arrays, Linked Lists, Stacks, Queues, Trees, BST, Graphs, Sorting & Hashing Algorithms' },
      { name: 'Computer Organization and Architecture', code: 'BCS302', subjectType: 'theory', credits: 4, desc: 'ALU Design, Instruction Pipeline, Pipelining, Cache Memory, and I/O Interfacing' },
      { name: 'Discrete Structures & Theory of Logic', code: 'BCS303', subjectType: 'theory', credits: 4, desc: 'Set Theory, Propositional Logic, Graph Theory, Combinatorics, and Group Theory' },
      { name: 'Technical Communication', code: '', subjectType: 'theory', credits: 2, desc: 'Technical Writing, Business Reports, Group Discussions, and Presentation Techniques' },
      { name: 'Cyber Security', code: '', subjectType: 'theory', credits: 3, desc: 'Cyber Threats, Cryptography Basics, Web Security, Cyber Laws, and IT Act' },
      { name: 'Python Programming', code: '', subjectType: 'theory', credits: 3, desc: 'Python Syntax, Control Flow, Data Structures (Lists, Dicts), Modules, and File I/O' },
      { name: 'Data Structure Lab', code: 'BCS351', subjectType: 'lab', credits: 1, desc: 'Practical C/C++ Implementation of Linked Lists, Trees, Graphs, and Sorting Algorithms' },
      { name: 'Computer Organization and Architecture Lab', code: 'BCS352', subjectType: 'lab', credits: 1, desc: 'Assembly Language Programming and Hardware Simulator Experiments' },
      { name: 'Web Designing Workshop', code: 'BCS353', subjectType: 'lab', credits: 2, desc: 'HTML5, CSS3, JavaScript DOM Manipulation, and Responsive UI Layout Workshop' },

      { name: 'Operating System', code: 'BCS401', subjectType: 'theory', credits: 4, desc: 'Processes, CPU Scheduling, Synchronization, Deadlocks, Memory Paging, and File Systems' },
      { name: 'Theory of Automata and Formal Languages', code: 'BCS402', subjectType: 'theory', credits: 4, desc: 'DFA, NFA, Regular Expressions, Context-Free Grammars, Pushdown Automata & Turing Machines' },
      { name: 'Object Oriented Programming with Java', code: 'BCS403', subjectType: 'theory', credits: 4, desc: 'Java OOPs, Classes, Inheritance, Interfaces, Multithreading, Exception Handling & Collections' },
      { name: 'Universal Human Value and Professional Ethics', code: '', subjectType: 'theory', credits: 3, desc: 'Values in Self, Family, Society, Nature, and Professional Ethics in Engineering' },
      { name: 'Operating System Lab', code: 'BCS451', subjectType: 'lab', credits: 1, desc: 'Linux System Calls, Process Synchronization, CPU Scheduling Simulation & Shell Scripts' },
      { name: 'Object Oriented Programming with Java Lab', code: 'BCS452', subjectType: 'lab', credits: 1, desc: 'Java Practical Programming, Multithreading, Exception Handling, and File Stream Labs' },
      { name: 'Cyber Security Workshop', code: 'BCS453', subjectType: 'lab', credits: 1, desc: 'Hands-on Web Security Auditing, Packet Sniffing, Cryptographic Algorithms & Pen-Testing' },

      // ================= THIRD YEAR & FOURTH YEAR CORE =================
      { name: 'Database Management System', code: 'BCS501', subjectType: 'theory', credits: 4, desc: 'ER Diagrams, Relational Algebra, SQL Queries, Normalization, ACID Transactions & Indexing' },
      { name: 'Web Technology', code: 'BCS502', subjectType: 'theory', credits: 4, desc: 'Client-Server Architecture, JavaScript ES6+, Node.js, Express.js, REST APIs & Web Security' },
      { name: 'Design and Analysis of Algorithm', code: 'BCS503', subjectType: 'theory', credits: 4, desc: 'Asymptotic Analysis, Divide & Conquer, Greedy Algorithms, Dynamic Programming, NP-Completeness' },
      { name: 'DBMS Lab', code: 'BCS551', subjectType: 'lab', credits: 1, desc: 'SQL Querying, Triggers, Stored Procedures, Indexing, and Relational Database Design Labs' },
      { name: 'Web Technology Lab', code: 'BCS552', subjectType: 'lab', credits: 1, desc: 'Full Stack Development using React, Node.js, Express, and MongoDB REST Endpoints' },
      { name: 'Design and Analysis of Algorithm Lab', code: 'BCS553', subjectType: 'lab', credits: 1, desc: 'Implementation of Sorting, Greedy, Dynamic Programming, Graph Traversals & MST Algorithms' },
      { name: 'Constitution of India', code: '', subjectType: 'other', credits: 2, desc: 'Fundamental Rights, Directive Principles, Preamble, Indian Union, and Constitutional Framework' },
      { name: 'Essence of Indian Traditional Knowledge', code: '', subjectType: 'other', credits: 2, desc: 'Indian Philosophical Thought, Science, Metallurgy, Architecture, and Cultural Heritage' },

      { name: 'Software Engineering', code: 'BCS601', subjectType: 'theory', credits: 4, desc: 'SDLC Models, Requirements Engineering, UML Modeling, Software Testing, Agile & DevOps' },
      { name: 'Computer Networks', code: 'BCS603', subjectType: 'theory', credits: 4, desc: 'OSI vs TCP/IP Architecture, Data Link Protocol, IPv4/v6 Addressing, Routing & Transport TCP/UDP' },
      { name: 'Software Engineering Lab', code: 'BCS651', subjectType: 'lab', credits: 1, desc: 'UML Diagramming using StarUML/Draw.io, SRS Document Writing, and Selenium Test Scripts' },
      { name: 'Computer Networks Lab', code: 'BCS653', subjectType: 'lab', credits: 1, desc: 'C/C++ Socket Programming, Cisco Packet Tracer, Wireshark Protocol Analysis & Subnetting' },

      { name: 'Artificial Intelligence', code: 'BCS701', subjectType: 'theory', credits: 4, desc: 'State Space Search (A*, Minimax), Constraint Satisfaction, First-Order Logic, Expert Systems' },
      { name: 'Artificial Intelligence Lab', code: 'BCS751', subjectType: 'lab', credits: 1, desc: 'Python Implementation of Heuristic Search, Game Tree Minimax, Prolog Logic & AI Pipelines' },

      // ================= CSE SPECIALIZED & ELECTIVE SUBJECTS =================
      { name: 'Compiler Design', code: 'BCS602', subjectType: 'theory', credits: 4, desc: 'Lexical Analysis, Flex/Bison, Syntax Directed Translation, Code Generation & Optimization' },
      { name: 'Compiler Design Lab', code: 'BCS652', subjectType: 'lab', credits: 1, desc: 'Lexical Analyzer & Syntax Parser Generation using Flex, Bison, and C Code Optimization' },
      { name: 'Statistical Computing', code: 'BCS051', subjectType: 'elective', credits: 3, desc: 'Probability Distributions, Regression Models, Hypothesis Testing, and R/Python Computing' },
      { name: 'Data Analytics', code: 'BCS052', subjectType: 'elective', credits: 3, desc: 'Exploratory Data Analysis, Data Wrangling, Visualization Techniques, and Predictive Modeling' },
      { name: 'Computer Graphics', code: 'BCS053', subjectType: 'elective', credits: 3, desc: 'Rasterization, 2D/3D Geometric Transformations, Clipping Algorithms, and OpenGL Renderers' },
      { name: 'Object Oriented System Design with C++', code: 'BCS054', subjectType: 'elective', credits: 3, desc: 'C++ Templates, STL Containers, OOP Design Patterns, UML Modeling, and System Architecture' },
      { name: 'Big Data', code: 'BCS061', subjectType: 'elective', credits: 3, desc: 'Hadoop Distributed File System (HDFS), MapReduce, Apache Spark, Hive, and Large-Scale Data' },
      { name: 'Augmented & Virtual Reality', code: 'BCS062', subjectType: 'elective', credits: 3, desc: '3D Spatial Computing, Unity/Unreal Engines, AR Core, VR Hardware, and Head-Mounted Displays' },
      { name: 'Blockchain Architecture Design', code: 'BCS063', subjectType: 'elective', credits: 3, desc: 'Distributed Ledgers, Consensus Protocols (PoW, PoS), Smart Contracts, Solidity & Ethereum' },
      { name: 'Data Compression', code: 'BCS064', subjectType: 'elective', credits: 3, desc: 'Lossless Coding (Huffman, Arithmetic), Lossy Compression, JPEG, MPEG, and Audio Encoding' },
      { name: 'Internet of Things', code: 'BCS070', subjectType: 'elective', credits: 3, desc: 'Sensors, Actuators, Microcontrollers (ESP32/Arduino), MQTT Protocols, Edge & Fog Computing' },
      { name: 'Cloud Computing', code: 'BCS071', subjectType: 'elective', credits: 3, desc: 'Cloud Virtualization, IaaS/PaaS/SaaS Architecture, AWS Services, Docker & Serverless' },
      { name: 'Cryptography and Network Security', code: 'BCS072', subjectType: 'elective', credits: 3, desc: 'Symmetric/Asymmetric Encryption (AES, RSA), Hashing (SHA-256), PKI, Firewalls & Intrusion Prevention' },
      { name: 'Design & Development of Applications', code: 'BCS073', subjectType: 'elective', credits: 3, desc: 'Cross-Platform Mobile Application Development, Flutter, React Native, REST Integration' },

      // ================= CSE-AIML SPECIALIZED SUBJECTS =================
      { name: 'Machine Learning Techniques', code: 'BAI501', subjectType: 'elective', credits: 3, desc: 'Supervised Learning, Logistic Regression, Decision Trees, SVM, Random Forests & Clustering' },
      { name: 'Application of Soft Computing', code: 'BCS056', subjectType: 'elective', credits: 3, desc: 'Fuzzy Logic, Genetic Algorithms, Neural Network Optimization, and Evolutionary Computing' },
      { name: 'Pattern Recognition', code: 'BAI502', subjectType: 'elective', credits: 3, desc: 'Feature Extraction, Bayesian Decision Theory, Discriminant Functions, Clustering' },
      { name: 'Artificial Neural Networks', code: 'BAI503', subjectType: 'elective', credits: 3, desc: 'Perceptrons, Backpropagation, Hopfield Networks, Radial Basis Functions' },
      { name: 'Deep Learning', code: 'BAI601', subjectType: 'theory', credits: 4, desc: 'Convolutional Neural Networks (CNN), Recurrent Networks (RNN, LSTM), Transformers & PyTorch' },
      { name: 'Natural Language Processing', code: 'BAI602', subjectType: 'elective', credits: 3, desc: 'Tokenization, N-grams, Word2Vec, Transformers, BERT, Sentiment Analysis & LLMs' },
      { name: 'Computer Vision', code: 'BAI603', subjectType: 'elective', credits: 3, desc: 'Image Features, Object Detection (YOLO), Instance Segmentation, Motion Analysis & OpenCV' },
      { name: 'Deep Learning Lab', code: 'BAI651', subjectType: 'lab', credits: 1, desc: 'PyTorch/TensorFlow Implementation of CNNs, ResNets, LSTMs, and Image Classification' },
      { name: 'Deep Reinforcement Learning', code: 'BAI701', subjectType: 'elective', credits: 3, desc: 'Q-Learning, Policy Gradients, Actor-Critic, Deep Q-Networks (DQN), OpenAI Gym' },
      { name: 'AI Ethics & Governance', code: 'BAI702', subjectType: 'elective', credits: 3, desc: 'Algorithmic Bias, AI Transparency, Explainable AI (XAI), Privacy and Regulatory Frameworks' },
      { name: 'Generative AI & LLMs', code: 'BAI703', subjectType: 'elective', credits: 3, desc: 'GANs, Diffusion Models, Transformer Attention Mechanisms, Fine-Tuning LLMs, RAG Pipelines' },

      // ================= CSE-DS SPECIALIZED SUBJECTS =================
      { name: 'Data Warehousing & Data Mining', code: 'BDS501', subjectType: 'elective', credits: 3, desc: 'ETL Pipelines, Dimensional Modeling, OLAP Cubes, Association Rule Mining, Classification' },
      { name: 'Data Visualization & Storytelling', code: 'BDS502', subjectType: 'elective', credits: 3, desc: 'Matplotlib, Seaborn, Tableau, Dashboard Design, Visual Analytics & Cognitive Perception' },
      { name: 'Big Data Analytics', code: 'BDS601', subjectType: 'theory', credits: 4, desc: 'HDFS, Apache Spark DataFrames, PySpark, Distributed Graph Processing, NoSQL Databases' },
      { name: 'Statistical Modeling & Inference', code: 'BDS602', subjectType: 'elective', credits: 3, desc: 'Maximum Likelihood Estimation, Bayesian Inference, ANOVA, Multivariate Analysis' },
      { name: 'Time Series Analysis & Forecasting', code: 'BDS603', subjectType: 'elective', credits: 3, desc: 'ARIMA, SARIMA, Stationarity Tests, GARCH Models, Spectral Density & LSTM Forecasting' },
      { name: 'Big Data Analytics Lab', code: 'BDS651', subjectType: 'lab', credits: 1, desc: 'Hadoop, PySpark DataFrames, Hive SQL Queries, and Streaming Analytics Labs' },
      { name: 'Business Analytics & Intelligence', code: 'BDS701', subjectType: 'elective', credits: 3, desc: 'KPI Analytics, Predictive Risk Modeling, Financial Analytics, Customer Churn & BI Dashboards' },
      { name: 'Data Security & Privacy', code: 'BDS702', subjectType: 'elective', credits: 3, desc: 'Differential Privacy, Homomorphic Encryption, Data Anonymization, GDPR Compliance' },
      { name: 'Cloud Data Engineering', code: 'BDS703', subjectType: 'elective', credits: 3, desc: 'Data Pipelines, Snowflake, AWS Redshift, Apache Airflow, Lakehouse Architectures' },
      { name: 'Data Science Capstone Lab', code: 'BDS751', subjectType: 'lab', credits: 1, desc: 'End-to-End Predictive Data Pipeline, Feature Engineering, and Model Deployment' },

      // ================= SEMESTER 8 (OPEN ELECTIVES) =================
      { name: 'Fundamentals of Drone Technology', code: 'BOE081', subjectType: 'elective', credits: 3, desc: 'Unmanned Aerial Vehicle (UAV) Flight Mechanics, Avionics, Sensor Payloads, and Navigation' },
      { name: 'Cloud Computing', code: 'BOE082', subjectType: 'elective', credits: 3, desc: 'Cloud Architecture, Microservices, Storage Infrastructure, Security, and Scalability' },
      { name: 'Biomedical Signal Processing', code: 'BOE083', subjectType: 'elective', credits: 3, desc: 'ECG/EEG Signal Filtering, Spectral Analysis, Feature Extraction, and Medical Instrumentation' },
      { name: 'Entrepreneurship Development', code: 'BOE084', subjectType: 'elective', credits: 3, desc: 'Business Plan Creation, Startup Funding, Market Research, IP Protection, and Ventures' },
      { name: 'Introduction to Smart Grid', code: 'BOE085', subjectType: 'elective', credits: 3, desc: 'Smart Metering, Renewable Energy Integration, Power Distribution Networks & Automation' },
      { name: 'Quality Management', code: 'BOE086', subjectType: 'elective', credits: 3, desc: 'Total Quality Management (TQM), Six Sigma Methodologies, ISO Standards, and Auditing' },
      { name: 'Industrial Optimization Techniques', code: 'BOE087', subjectType: 'elective', credits: 3, desc: 'Linear Programming, Simplex Method, Queuing Theory, Transportation & Inventory Control' },
      { name: 'Virology', code: 'BOE088', subjectType: 'elective', credits: 3, desc: 'Viral Structures, Replication Mechanisms, Antiviral Diagnostics, and Bio-informatics Applications' },
      { name: 'Natural Language Processing', code: 'BOE089', subjectType: 'elective', credits: 3, desc: 'Text Normalization, N-grams, Word Embeddings, Transformers, Sentiment Analysis & LLMs' },
      { name: 'Human Values in Madhyasth Darshan', code: 'BOE090', subjectType: 'elective', credits: 3, desc: 'Co-existential Philosophy, Consciousness Development, Harmony in Living & Social Values' },
      { name: 'Electric Vehicles', code: 'BOE091', subjectType: 'elective', credits: 3, desc: 'EV Powertrains, Lithium-Ion Battery Management Systems (BMS), Electric Motors & Chargers' },
      { name: 'Automation and Robotics', code: 'BOE092', subjectType: 'elective', credits: 3, desc: 'Robotic Kinematics, Industrial Manipulators, Actuators, Programmable Logic Controllers (PLC)' },
      { name: 'Computerized Process Control', code: 'BOE093', subjectType: 'elective', credits: 3, desc: 'SCADA Systems, Distributed Control Systems (DCS), PID Controllers, and Process Automation' },
      { name: 'Data Warehousing & Data Mining', code: 'BOE094', subjectType: 'elective', credits: 3, desc: 'Data Repository Architecture, Dimensional Modeling, Mining Algorithms, and Business Intelligence' },
      { name: 'Digital and Social Media Marketing', code: 'BOE095', subjectType: 'elective', credits: 3, desc: 'Search Engine Optimization (SEO), Content Strategy, Social Media Campaigns & Ad Analytics' },
      { name: 'Modeling of Field-Effect Nano Devices', code: 'BOE096', subjectType: 'elective', credits: 3, desc: 'MOSFET Scaling, FinFET, Nanowires, Quantum Effects, and Nanoelectronic Device Physics' },
      { name: 'Modelling and Simulation of Dynamic Systems', code: 'BOE097', subjectType: 'elective', credits: 3, desc: 'System Dynamics, Bond Graph Modeling, Differential Equation Simulators & MATLAB/Simulink' },
      { name: 'Big Data', code: 'BOE098', subjectType: 'elective', credits: 3, desc: 'Distributed Storage, Apache Spark, NoSQL Storage, Streaming Analytics, and Hadoop Ecosystem' },
      { name: 'Human Values in Buddha and Jain Darshan', code: 'BOE099', subjectType: 'elective', credits: 3, desc: 'Philosophical Tenets of Buddhism and Jainism, Ethics, Non-Violence, and Universal Harmony' },
      { name: 'Human Values in Vedic Darsana', code: 'BOE100', subjectType: 'elective', credits: 3, desc: 'Vedic Epistemology, Self-Realization Principles, Ethical Conduct, and Classical Indian Thought' },
    ];

    console.log(`[Seeder] Cleaning legacy duplicate canonical Subjects if present...`);
    const allExistingSubjects = await Subject.find({});
    const seenNameMap = {};
    for (const sDoc of allExistingSubjects) {
      const normName = sDoc.name ? sDoc.name.trim().toLowerCase() : '';
      if (!normName) continue;
      if (!seenNameMap[normName]) {
        seenNameMap[normName] = sDoc;
      } else {
        const canonicalId = seenNameMap[normName]._id;
        const duplicateId = sDoc._id;
        await SubjectOffering.updateMany({ subjectId: duplicateId }, { subjectId: canonicalId });
        await Unit.updateMany({ subjectId: duplicateId }, { subjectId: canonicalId });
        await Resource.updateMany({ subjectId: duplicateId }, { subjectId: canonicalId });
        await Subject.findByIdAndDelete(duplicateId);
      }
    }

    console.log(`[Seeder] Seeding unique canonical Subjects...`);

    const canonicalSubjectMap = {}; // key: code or normalized name => subjectDoc

    for (const sub of masterSubjectsData) {
      const cleanCode = sub.code ? sub.code.trim().toUpperCase() : '';
      const cleanName = sub.name ? sub.name.trim() : '';

      const normReg = new RegExp('^' + cleanName.replace(/([.*+?^${}()|[\]\\])/g, '\\$1').replace(/\s+/g, '\\s+') + '$', 'i');
      let filter = cleanCode ? { $or: [{ code: cleanCode }, { name: normReg }] } : { name: normReg };

      const subjectDoc = await Subject.findOneAndUpdate(
        filter,
        {
          name: cleanName,
          code: cleanCode,
          description: sub.desc || '',
          subjectType: sub.subjectType,
          credits: sub.credits || 3,
          branchId: branchMap['cse']._id,
        },
        { upsert: true, new: true }
      );

      const keyByCode = cleanCode.toLowerCase();
      const keyByName = cleanName.toLowerCase();
      if (keyByCode) canonicalSubjectMap[keyByCode] = subjectDoc;
      if (keyByName) canonicalSubjectMap[keyByName] = subjectDoc;
    }

    console.log(`[Seeder] Created/verified canonical subjects count: ${Object.keys(canonicalSubjectMap).length / 2 | 0}`);

    // 4. EXPLICIT BRANCH MAPPINGS PER SEMESTER
    const offeringsToCreate = [];

    const addOffering = (subjectKey, semNum, branchCode, credits = 3) => {
      const normKey = subjectKey ? subjectKey.trim().toLowerCase() : '';
      const sDoc = canonicalSubjectMap[normKey] || canonicalSubjectMap[subjectKey];
      if (sDoc && branchMap[branchCode]) {
        const semId = semesterMap[`${branchCode}-${semNum}`];
        if (semId) {
          offeringsToCreate.push({
            subjectId: sDoc._id,
            branchId: branchMap[branchCode]._id,
            semesterId: semId,
            semesterNumber: semNum,
            credits: sDoc.credits || credits,
          });
        }
      } else {
        console.warn(`[Seeder Warning] Could not find subject mapping for key: "${subjectKey}" under branch "${branchCode}"`);
      }
    };

    // --- SEMESTER 1 (COMMON ACROSS CSE, CSE-AIML, CSE-DS) ---
    const sem1Common = [
      'Quantum Physics and Applications', 'Applied Chemistry for Smart Systems', 'Calculus and Linear Algebra',
      'Fundamentals of Electrical Engineering', 'Fundamentals of Electronics Engineering', 'Programming Languages',
      'Introduction to Indian Knowledge System', 'Professional Communication & Technical Writing',
      'Introduction to AI & Prompt Engineering', 'Fundamentals of Mechanical Engineering',
      'Applied Physics Lab', 'Applied Chemistry for Smart Systems Lab', 'Electrical Engineering Lab',
      'Electronics Engineering Lab', 'Computer-Aided Engineering Drawing Lab', 'Innovation & Design Thinking Lab',
      'Language Lab', 'Environment & Sustainability'
    ];
    sem1Common.forEach(k => ['cse', 'cse-aiml', 'cse-ds'].forEach(b => addOffering(k, 1, b)));

    // --- SEMESTER 2 (COMMON ACROSS CSE, CSE-AIML, CSE-DS) ---
    const sem2Common = [
      'Quantum Physics and Applications', 'Applied Chemistry for Smart Systems', 'Numerical Methods',
      'Fundamentals of Electrical Engineering', 'Fundamentals of Electronics Engineering', 'Essentials of Data Structure',
      'Introduction to Indian Knowledge System', 'Professional Communication & Technical Writing',
      'Introduction to AI & Prompt Engineering', 'Fundamentals of Mechanical Engineering',
      'Applied Physics Lab', 'Applied Chemistry for Smart Systems Lab', 'Electrical Engineering Lab',
      'Electronics Engineering Lab', 'Computer-Aided Engineering Drawing Lab', 'Innovation & Design Thinking Lab',
      'Language Lab', 'Environment & Sustainability'
    ];
    sem2Common.forEach(k => ['cse', 'cse-aiml', 'cse-ds'].forEach(b => addOffering(k, 2, b)));

    // --- SEMESTER 3 (COMMON CORE CS ACROSS CSE, CSE-AIML, CSE-DS) ---
    const sem3Common = ['BCS301', 'BCS302', 'BCS303', 'technical communication', 'cyber security', 'python programming', 'BCS351', 'BCS352', 'BCS353'];
    sem3Common.forEach(k => ['cse', 'cse-aiml', 'cse-ds'].forEach(b => addOffering(k, 3, b)));

    // --- SEMESTER 4 (COMMON CORE CS ACROSS CSE, CSE-AIML, CSE-DS) ---
    const sem4Common = ['BCS401', 'BCS402', 'BCS403', 'technical communication', 'universal human value and professional ethics', 'python programming', 'cyber security', 'BCS451', 'BCS452', 'BCS453'];
    sem4Common.forEach(k => ['cse', 'cse-aiml', 'cse-ds'].forEach(b => addOffering(k, 4, b)));

    // --- SEMESTER 5 ---
    const sem5Core = ['BCS501', 'BCS502', 'BCS503', 'BCS551', 'BCS552', 'BCS553', 'constitution of india', 'essence of indian traditional knowledge'];
    sem5Core.forEach(k => ['cse', 'cse-aiml', 'cse-ds'].forEach(b => addOffering(k, 5, b)));
    ['BCS051', 'BCS052', 'BCS053', 'BCS054'].forEach(k => addOffering(k, 5, 'cse'));
    ['BAI501', 'BCS056', 'BAI502', 'BAI503'].forEach(k => addOffering(k, 5, 'cse-aiml'));
    ['BDS501', 'BCS051', 'BCS052', 'BDS502'].forEach(k => addOffering(k, 5, 'cse-ds'));

    // --- SEMESTER 6 ---
    const sem6Core = ['BCS601', 'BCS603', 'BCS651', 'BCS653'];
    sem6Core.forEach(k => ['cse', 'cse-aiml', 'cse-ds'].forEach(b => addOffering(k, 6, b)));
    ['BCS602', 'BCS652', 'BCS061', 'BCS062', 'BCS063', 'BCS064'].forEach(k => addOffering(k, 6, 'cse'));
    ['BAI601', 'BAI602', 'BAI603', 'BAI651'].forEach(k => addOffering(k, 6, 'cse-aiml'));
    ['BDS601', 'BDS602', 'BDS603', 'BDS651'].forEach(k => addOffering(k, 6, 'cse-ds'));

    // --- SEMESTER 7 ---
    const sem7Core = ['BCS701', 'BCS751'];
    sem7Core.forEach(k => ['cse', 'cse-aiml', 'cse-ds'].forEach(b => addOffering(k, 7, b)));
    ['BCS070', 'BCS071', 'BCS072', 'BCS073'].forEach(k => addOffering(k, 7, 'cse'));
    ['BAI701', 'BAI702', 'BAI703'].forEach(k => addOffering(k, 7, 'cse-aiml'));
    ['BDS701', 'BDS702', 'BDS703'].forEach(k => addOffering(k, 7, 'cse-ds'));

    // --- SEMESTER 8 (OPEN ELECTIVES OFFERED ACROSS BRANCHES) ---
    const sem8OpenElectives = [
      'BOE081', 'BOE082', 'BOE083', 'BOE084', 'BOE085', 'BOE086', 'BOE087', 'BOE088', 'BOE089', 'BOE090',
      'BOE091', 'BOE092', 'BOE093', 'BOE094', 'BOE095', 'BOE096', 'BOE097', 'BOE098', 'BOE099', 'BOE100'
    ];
    sem8OpenElectives.forEach(k => ['cse', 'cse-aiml', 'cse-ds'].forEach(b => addOffering(k, 8, b)));

    console.log(`[Seeder] Upserting ${offeringsToCreate.length} explicit SubjectOfferings...`);

    let totalOfferingsCount = 0;
    for (const off of offeringsToCreate) {
      await SubjectOffering.findOneAndUpdate(
        {
          subjectId: off.subjectId,
          branchId: off.branchId,
          semesterId: off.semesterId,
        },
        off,
        { upsert: true, new: true }
      );
      totalOfferingsCount++;
    }
    console.log(`[Seeder] Seeded ${totalOfferingsCount} SubjectOfferings cleanly!`);

    // 5. Seed Syllabus Units for Core Canonical Subjects
    const coreSubjectsList = [
      { code: 'BCS301', name: 'Data Structure' },
      { code: 'BCS302', name: 'Computer Organization and Architecture' },
      { code: 'BCS401', name: 'Operating System' },
      { code: 'BCS403', name: 'Object Oriented Programming with Java' },
      { code: 'BCS501', name: 'Database Management System' },
      { code: 'BCS502', name: 'Web Technology' },
      { code: 'BCS601', name: 'Software Engineering' },
      { code: 'BCS602', name: 'Compiler Design' },
      { code: 'BCS603', name: 'Computer Networks' },
      { code: 'BCS701', name: 'Artificial Intelligence' },
      { code: 'BAI601', name: 'Deep Learning' },
      { code: 'BDS601', name: 'Big Data Analytics' },
    ];

    let totalUnits = 0;
    for (const core of coreSubjectsList) {
      const subj = canonicalSubjectMap[core.code.toLowerCase()] || canonicalSubjectMap[core.name.toLowerCase()];
      if (subj) {
        const unitsData = [
          { unitNumber: 1, title: `${core.name} Unit 1: Foundations & Architecture`, description: `Fundamental concepts, definitions, and core principles of ${core.name}.` },
          { unitNumber: 2, title: `${core.name} Unit 2: Algorithmic Formulations`, description: `Mathematical models, structural design, and processing paradigms.` },
          { unitNumber: 3, title: `${core.name} Unit 3: System Optimization & Control`, description: `Detailed algorithmic strategies, optimization techniques, and implementations.` },
          { unitNumber: 4, title: `${core.name} Unit 4: Protocols & Security Patterns`, description: `Design patterns, interface standards, protocols, and security considerations.` },
          { unitNumber: 5, title: `${core.name} Unit 5: Industrial Applications`, description: `Real-world engineering applications, industry benchmarks, and emerging trends.` },
        ];

        for (const u of unitsData) {
          await Unit.findOneAndUpdate(
            { subjectId: subj._id, unitNumber: u.unitNumber },
            { subjectId: subj._id, unitNumber: u.unitNumber, title: u.title, description: u.description },
            { upsert: true, new: true }
          );
          totalUnits++;
        }
      }
    }
    console.log(`[Seeder] Seeded ${totalUnits} canonical syllabus units`);

    // 6. Seed Common Shared Resources (branchId: null) & Branch-Specific Resources
    const sampleResources = [
      {
        title: 'Data Structure Unit 1 Complete Shared Lecture Notes',
        desc: 'Shared handwritten & digital notes covering Arrays, Stacks, Queues (Common for CSE, CSE-AIML, CSE-DS).',
        type: 'notes',
        subjectCode: 'BCS301',
        branchCode: null, // COMMON RESOURCE for all branches!
        sem: 3,
        unitNum: 1,
        fileUrl: SAMPLE_PDF_URL,
        tags: ['Data Structures', 'Common Notes', 'AKTU', 'Unit 1'],
      },
      {
        title: 'Operating System End-Semester PYQ Paper 2024',
        desc: 'Common 2024 End Semester question paper with solution keys.',
        type: 'pyq',
        subjectCode: 'BCS401',
        branchCode: null, // COMMON RESOURCE
        sem: 4,
        unitNum: null,
        fileUrl: SAMPLE_PDF_URL,
        examYear: 2024,
        examType: 'End Semester',
        tags: ['PYQ', 'Operating Systems', '2024', 'AKTU'],
      },
      {
        title: 'DBMS Unit 1 ER Diagrams & Relational Model PDF',
        desc: 'Study guide detailing Entity-Relationship mapping and relational algebra with examples.',
        type: 'pdf',
        subjectCode: 'BCS501',
        branchCode: null, // COMMON RESOURCE
        sem: 5,
        unitNum: 1,
        fileUrl: SAMPLE_PDF_URL,
        tags: ['DBMS', 'ER Model', 'Relational Algebra', 'PDF'],
      },
      {
        title: 'Deep Learning CNN & PyTorch Architecture Notes',
        desc: 'Specialized AIML study guide for Convolutional Neural Networks and PyTorch training.',
        type: 'notes',
        subjectCode: 'BAI601',
        branchCode: 'cse-aiml', // BRANCH-SPECIFIC RESOURCE
        sem: 6,
        unitNum: 1,
        fileUrl: SAMPLE_PDF_URL,
        tags: ['Deep Learning', 'PyTorch', 'CNN', 'CSE-AIML'],
      },
      {
        title: 'Big Data Analytics PySpark & HDFS Lab Manual',
        desc: 'Specialized Data Science lab manual detailing PySpark RDDs, DataFrames and HDFS.',
        type: 'pdf',
        subjectCode: 'BDS601',
        branchCode: 'cse-ds', // BRANCH-SPECIFIC RESOURCE
        sem: 6,
        unitNum: 1,
        fileUrl: SAMPLE_PDF_URL,
        tags: ['Big Data', 'PySpark', 'HDFS', 'CSE-DS'],
      }
    ];

    let totalRes = 0;
    for (const r of sampleResources) {
      const subj = canonicalSubjectMap[r.subjectCode.toLowerCase()];
      if (subj) {
        let unitId = null;
        if (r.unitNum) {
          const uDoc = await Unit.findOne({ subjectId: subj._id, unitNumber: r.unitNum });
          if (uDoc) unitId = uDoc._id;
        }

        const bId = r.branchCode ? branchMap[r.branchCode]?._id : null;
        
        let targetSemId = null;
        if (r.branchCode) {
          targetSemId = semesterMap[`${r.branchCode}-${r.sem}`];
        } else {
          // Common resource: resolve semesterId from offering
          const offering = await SubjectOffering.findOne({ subjectId: subj._id, semesterNumber: r.sem });
          targetSemId = offering ? offering.semesterId : semesterMap[`cse-${r.sem}`];
        }

        await Resource.findOneAndUpdate(
          { title: r.title, subjectId: subj._id },
          {
            title: r.title,
            description: r.desc,
            type: r.type,
            branchId: bId,
            semesterId: targetSemId,
            subjectId: subj._id,
            unitId,
            fileUrl: r.fileUrl,
            externalUrl: r.fileUrl,
            tags: r.tags,
            examYear: r.examYear || null,
            examType: r.examType || '',
          },
          { upsert: true, new: true }
        );
        totalRes++;
      }
    }
    console.log(`[Seeder] Seeded ${totalRes} academic resources (Common + Branch-Specific)`);

    // 7. SEED VALIDATION SUITE
    await validateSeededData();

    console.log('=============================================================================');
    console.log('[Seeder] Multi-Branch Academic Architecture Seeding Completed Cleanly!');
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

// Seed Validation Suite
const validateSeededData = async () => {
  console.log('\n[Validation] Running Academic Database Integrity Assertions...');

  // 1. Check duplicate canonical subject codes
  const codeDups = await Subject.aggregate([
    { $match: { code: { $ne: '' } } },
    { $group: { _id: '$code', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  if (codeDups.length > 0) {
    console.error('[Validation Fail] Duplicate subject codes detected:', codeDups);
  } else {
    console.log('  ✓ Assertion Passed: Zero duplicate canonical subject codes');
  }

  // 2. Check duplicate canonical subject names
  const nameDups = await Subject.aggregate([
    { $group: { _id: { $toLower: '$name' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  if (nameDups.length > 0) {
    console.error('[Validation Fail] Duplicate subject names detected:', nameDups);
  } else {
    console.log('  ✓ Assertion Passed: Zero duplicate canonical subject names');
  }

  // 3. Check duplicate SubjectOfferings
  const offeringDups = await SubjectOffering.aggregate([
    { $group: { _id: { subjectId: '$subjectId', branchId: '$branchId', semesterId: '$semesterId' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  if (offeringDups.length > 0) {
    console.error('[Validation Fail] Duplicate SubjectOfferings detected:', offeringDups);
  } else {
    console.log('  ✓ Assertion Passed: Zero duplicate SubjectOfferings');
  }

  // 4. Verify branch-specific subjects mapping isolation
  const dlSubject = await Subject.findOne({ name: 'Deep Learning' });
  if (dlSubject) {
    const dlOfferings = await SubjectOffering.find({ subjectId: dlSubject._id }).populate('branchId');
    const branchCodes = dlOfferings.map(o => o.branchId.code);
    if (branchCodes.includes('cse-aiml') && !branchCodes.includes('cse')) {
      console.log('  ✓ Assertion Passed: Specialized subject "Deep Learning" is isolated strictly to CSE-AIML');
    } else {
      console.error('[Validation Warning] "Deep Learning" branch mapping unexpected:', branchCodes);
    }
  }

  // 5. Verify Resources integrity
  const orphanResources = await Resource.find({ subjectId: null });
  if (orphanResources.length > 0) {
    console.error('[Validation Fail] Resources with missing subjectId detected:', orphanResources.length);
  } else {
    console.log('  ✓ Assertion Passed: Zero resources with missing subject references');
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
