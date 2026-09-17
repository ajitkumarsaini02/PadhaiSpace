const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables if not already present
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

const connectDB = async () => {
  const rawURI = process.env.MONGODB_URI;

  if (!rawURI) {
    console.error('===========================================================');
    console.error('❌ MONGODB_URI IS MISSING IN ENVIRONMENT VARIABLES!');
    console.error('👉 Please go to Render Dashboard -> Environment -> Add:');
    console.error('   Key: MONGODB_URI');
    console.error('   Value: mongodb://127.0.0.1:27017/padhaiSpace');
    console.error('===========================================================');
  }

  const mongoURI = rawURI || 'mongodb://127.0.0.1:27017/padhaiSpace';
  const maskedURI = mongoURI.replace(/:([^@]+)@/, ':****@');

  console.log(`[DB] Attempting MongoDB connection to: ${maskedURI}`);

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
