const mongoose = require('mongoose');

const seedingHistorySchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string IDs
    required: true
  },
  title: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  bytesUploaded: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  }, // in seconds
  peers: {
    type: Number,
    default: 0
  } // max peers served
});

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.Mixed, // Allow string IDs like 'demo123'
    auto: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    trim: true
  },
  profileImage: String,
  github: {
    id: String,
    username: String,
    email: String,
    avatar: String
  },
  telegram: {
    id: String,
    username: String,
    chatId: String
  },
  // Added Telegram fields for better tracking
  telegramId: {
    type: String,
    unique: true,
    sparse: true
  },
  telegramHandle: {
    type: String,
    trim: true
  },
  telegramUsername: {
    type: String,
    trim: true
  },
  telegramPhotoUrl: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  tokens: {
    type: Number,
    default: 0
  },
  tokenHistory: [{
    amount: Number,
    reason: String,
    contentId: {
      type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string IDs
      required: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  seedingStats: {
    totalBytesUploaded: {
      type: Number,
      default: 0
    },
    totalSeedingTime: {
      type: Number,
      default: 0
    }, // in seconds
    totalPeersServed: {
      type: Number,
      default: 0
    },
    activeSeedingCount: {
      type: Number,
      default: 0
    },
    rewardsEarned: {
      type: Number,
      default: 0
    },
    contentSeeded: {
      type: Number,
      default: 0
    }
  },
  seedingHistory: [seedingHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'content-creator'],
    default: 'user'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    autoSeed: {
      type: Boolean,
      default: true
    },
    seedingLimit: {
      type: Number,
      default: 0
    } // 0 means unlimited
  }
});

// Virtual for user's seeding rank based on metrics
userSchema.virtual('seedingRank').get(function() {
  // Simple rank calculation based on uploads and time
  const uploadWeight = 0.7;
  const timeWeight = 0.3;
  
  const normalizedUpload = this.seedingStats.totalBytesUploaded / (1024 * 1024 * 1024); // Convert to GB
  const normalizedTime = this.seedingStats.totalSeedingTime / (3600 * 24); // Convert to days
  
  const score = (normalizedUpload * uploadWeight) + (normalizedTime * timeWeight);
  
  // Rank tiers
  if (score > 100) return 'Diamond';
  if (score > 50) return 'Platinum';
  if (score > 20) return 'Gold';
  if (score > 10) return 'Silver';
  if (score > 5) return 'Bronze';
  return 'Starter';
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;