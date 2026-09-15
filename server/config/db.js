const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Ensure dotenv is loaded if process.env.MONGODB_URI is not set
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/padhaiSpace';

  if (process.env.NODE_ENV === 'production' && (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('127.0.0.1'))) {
    console.error('❌ CRITICAL ERROR: process.env.MONGODB_URI is not set in Render Environment Variables!');
    console.error('👉 Please go to Render Dashboard -> Environment Variables -> Add MONGODB_URI (your MongoDB Atlas connection string).');
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected successfully`);
    return conn;
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
