const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoOptions = {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds instead of 30
      socketTimeoutMS: 45000, // How long sockets stay active before closing
      useNewUrlParser: true, // False by default for mongoose 7, but keeping for compatibility
      useUnifiedTopology: true // False by default for mongoose 7, but keeping for compatibility
    };
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, mongoOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't exit process, let caller handle retry
    throw error;
  }
};

module.exports = connectDB;