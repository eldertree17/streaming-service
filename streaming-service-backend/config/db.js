const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoOptions = {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds instead of 30
      socketTimeoutMS: 45000, // How long sockets stay active before closing
      // Removing deprecated options
    };
    
    console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI ? '(URI is set)' : '(URI is NOT set!)');
    
    // Try to connect
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, mongoOptions);
    
    console.log('===== MONGODB CONNECTION SUCCESSFUL =====');
    console.log(`MongoDB Connected to: ${conn.connection.host}`);
    console.log(`MongoDB Database name: ${conn.connection.name}`);
    console.log(`MongoDB Connection state: ${conn.connection.readyState}`);
    return conn;
  } catch (error) {
    console.error('===== MONGODB CONNECTION ERROR =====');
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
    
    // Don't exit process, let caller handle retry
    throw error;
  }
};

module.exports = connectDB;