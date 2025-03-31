const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  posterImage: {
    type: String,
    required: true
  },
  magnetLink: {
    type: String,
    required: true
  },
  telegramChannelId: {
    type: String,
    required: true
  },
  genre: {
    type: [String],
    required: true
  },
  releaseYear: {
    type: Number
  },
  duration: {
    type: String
  },
  // Replace the rating field with likes and dislikes
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
ContentSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Content', ContentSchema);