console.log('===== Starting server initialization =====');
const express = require('express');
console.log('Express loaded successfully');
const dotenv = require('dotenv');
console.log('Dotenv loaded successfully');
const cors = require('cors');
console.log('CORS loaded successfully');
const connectDB = require('./config/db');
console.log('Database connection module loaded');
const path = require('path');
console.log('Path module loaded');
const fs = require('fs');
console.log('File system module loaded');
const mongoose = require('mongoose');
console.log('Mongoose loaded successfully');

// Load env vars
console.log('Loading environment variables...');
dotenv.config();
console.log('Environment variables loaded');

// Connect to database
console.log('Attempting to connect to MongoDB...');
try {
  // Add connection timeout and retry logic
  const connectWithRetry = async () => {
    try {
      await connectDB();
      console.log('MongoDB connection successful');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    }
  };
  connectWithRetry();
} catch (error) {
  console.error('Error in connection setup:', error);
  // Don't exit process, let server start anyway
}

// Initialize app
console.log('Initializing Express app...');
const app = express();
console.log('Express app initialized');

// Middleware
console.log('Setting up middleware...');
// Set up CORS to allow requests from specific origins
const allowedOrigins = [
  'https://eldertree17.github.io',
  'http://localhost:3000',
  'http://localhost:5006'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.match(/^https:\/\/eldertree17\.github\.io/)) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user']
}));

// Parse JSON bodies
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

console.log('Middleware setup complete');

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));
console.log('Static file serving set up');

// Import routes
const contentRoutes = require('./routes/content');
const metricsRoutes = require('./routes/metrics');

// Routes
console.log('Setting up routes...');
try {
  app.use('/api/content', contentRoutes);
  app.use('/api/metrics', metricsRoutes);
  
  // Only initialize Telegram routes if environment variables are set
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.APP_URL) {
    console.log('Initializing Telegram bot service...');
    const telegramRoutes = require('./routes/telegram.routes');
    app.use('/api/telegram', telegramRoutes);
    console.log('Telegram routes initialized successfully');
  } else {
    console.log('Skipping Telegram initialization - missing environment variables');
  }
  
  console.log('Routes setup complete');
} catch (error) {
  console.error('Error setting up routes:', error);
}

// Sample video streaming endpoint
app.get('/api/video', (req, res) => {
  console.log('Video streaming endpoint accessed');
  
  // Create a sample video with Big Buck Bunny details
  const sampleVideoData = {
    _id: 'sample-video-1',
    title: 'Big Buck Bunny',
    description: 'Big Buck Bunny is a short animated film by the Blender Institute, part of the Blender Foundation. It\'s a public domain test video that\'s widely used for testing video players.',
    posterImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
    magnetLink: 'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent',
    telegramChannelId: '@bigbuckbunny',
    genre: ['Animation', 'Short', 'Comedy', 'Public Domain'],
    releaseYear: 2008,
    duration: '9m 56s',
    likes: 9999,
    dislikes: 0,
    createdAt: new Date()
  };
  
  res.json(sampleVideoData);
});

// Direct video streaming endpoint
app.get('/api/direct-video', (req, res) => {
  console.log('Direct video streaming endpoint accessed');
  
  // Path to the Big Buck Bunny MP4 file
  const videoUrl = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4';
  
  // Redirect to the video file
  res.redirect(videoUrl);
});

// Basic route
app.get('/', (req, res) => {
  console.log('Root route accessed');
  // Send a proper health check response with 200 status
  res.status(200).json({
    status: 'success',
    message: 'StreamFlix API is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Global error handler middleware - must be added after all routes
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    timestamp: new Date()
  });
});

// 404 handler - must be the last middleware
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date()
  });
});

// Error handling for unhandled rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection:', err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err.message);
  // Close server & exit process
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
console.log(`Attempting to start server on port ${PORT}...`);
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  // Log environment variables for debugging (obscure sensitive info)
  console.log('Environment variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (value hidden)' : 'Not set');
  console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set (value hidden)' : 'Not set');
  console.log('APP_URL:', process.env.APP_URL);
});
console.log('Server listen command executed');