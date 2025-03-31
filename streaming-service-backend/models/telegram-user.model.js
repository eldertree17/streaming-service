const mongoose = require('mongoose');

const telegramUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        sparse: true
    },
    firstName: String,
    lastName: String,
    chatId: {
        type: String,
        required: true,
        unique: true
    },
    loginToken: {
        type: String,
        sparse: true
    },
    loginTokenExpires: Date,
    lastInteraction: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
telegramUserSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Create indexes
telegramUserSchema.index({ telegramId: 1 });
telegramUserSchema.index({ chatId: 1 });
telegramUserSchema.index({ loginToken: 1 });
telegramUserSchema.index({ userId: 1 });

const TelegramUser = mongoose.model('TelegramUser', telegramUserSchema);

module.exports = TelegramUser; 