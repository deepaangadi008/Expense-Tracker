const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);

    const allowInMemory = process.env.ALLOW_IN_MEMORY_DB === 'true';
    if (!allowInMemory) {
      console.error('In-memory fallback is disabled to protect data persistence.');
      console.error('Start MongoDB and verify MONGODB_URI in server/.env.');
      process.exit(1);
    }

    console.warn('Using in-memory MongoDB fallback. Data will be lost after server restart.');

    try {
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      const memConn = await mongoose.connect(memUri);
      console.log(`In-memory MongoDB connected: ${memConn.connection.host}`);
    } catch (memError) {
      console.error('Failed to start in-memory MongoDB:', memError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
