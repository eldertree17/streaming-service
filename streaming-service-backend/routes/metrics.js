const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Constants for token rewards
const TOKENS_PER_GB_UPLOADED = 10;
const TOKENS_PER_SECOND_SEEDED = 0.5;
const TOKENS_PER_PEER_SERVED = 1;

/**
 * @route POST /api/metrics/seeding
 * @desc Record seeding metrics and award tokens
 * @access Private
 */
router.post('/seeding', auth, async (req, res) => {
  try {
    const { 
      contentId, 
      bytesUploaded, 
      seedingTime, 
      peersConnected,
      isActive,
      title,
      telegramId,
      telegramHandle,
      telegramUsername
    } = req.body;

    // Validate input - accept both MongoDB ObjectId and string IDs
    if (!contentId) {
      return res.status(400).json({ error: 'Content ID is required' });
    }

    // Create a demo user if it doesn't exist when using demo mode
    let user = null;
    if (req.user.id === 'demo123') {
      // Check if demo user exists, if not create one
      user = await User.findById('demo123');
      if (!user) {
        // Create a new demo user
        user = new User({
          _id: 'demo123',
          username: 'demo_user',
          email: 'demo@example.com',
          password: 'password123', // Not a security risk as this is just a demo user
          seedingStats: {
            totalBytesUploaded: 0,
            totalSeedingTime: 0,
            totalPeersServed: 0,
            activeSeedingCount: 0,
            rewardsEarned: 0,
            contentSeeded: 0
          },
          seedingHistory: [],
          tokenHistory: []
        });
        await user.save();
        console.log('Created demo user with ID demo123');
      }
    } else {
      // For regular users, find by ID
      user = await User.findById(req.user.id);
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update Telegram data if provided
    if (telegramId && !user.telegramId) {
      user.telegramId = telegramId;
    }
    if (telegramHandle && !user.telegramHandle) {
      user.telegramHandle = telegramHandle;
    }
    if (telegramUsername && !user.telegramUsername) {
      user.telegramUsername = telegramUsername;
    }

    // Update user's total seeding stats
    user.seedingStats.totalBytesUploaded += bytesUploaded || 0;
    user.seedingStats.totalSeedingTime += seedingTime || 0;
    
    if (peersConnected > 0) {
      user.seedingStats.totalPeersServed += peersConnected;
    }

    // Find or create seeding history entry for this content
    let seedingEntry = user.seedingHistory.find(
      entry => entry.contentId && (entry.contentId.toString() === contentId.toString())
    );

    if (!seedingEntry) {
      // This is a new content item being seeded
      seedingEntry = {
        contentId,
        title: title || 'Unknown Content',
        startTime: new Date(),
        bytesUploaded: 0,
        duration: 0,
        peers: 0
      };
      user.seedingHistory.push(seedingEntry);
      user.seedingStats.contentSeeded += 1;
    }

    // Update the seeding entry
    seedingEntry = user.seedingHistory[user.seedingHistory.length - 1];
    seedingEntry.bytesUploaded += bytesUploaded || 0;
    seedingEntry.duration += seedingTime || 0;
    seedingEntry.peers = Math.max(seedingEntry.peers, peersConnected || 0);

    // If seeding has ended, set the end time
    if (isActive === false) {
      seedingEntry.endTime = new Date();
      user.seedingStats.activeSeedingCount = Math.max(0, user.seedingStats.activeSeedingCount - 1);
    } else if (isActive === true && !seedingEntry.endTime) {
      // Active seeding
      user.seedingStats.activeSeedingCount += 1;
    }

    // Calculate tokens earned for this update
    let tokensEarned = 0;
    
    // Tokens for bytes uploaded (convert to GB for calculation)
    const gbUploaded = (bytesUploaded || 0) / (1024 * 1024 * 1024);
    tokensEarned += gbUploaded * TOKENS_PER_GB_UPLOADED;
    
    // Tokens for seeding time (now directly using seconds)
    const secondsSeeded = seedingTime || 0;
    tokensEarned += secondsSeeded * TOKENS_PER_SECOND_SEEDED;
    
    // Tokens for peers served
    tokensEarned += (peersConnected || 0) * TOKENS_PER_PEER_SERVED;
    
    // Round to 2 decimal places
    tokensEarned = Math.round(tokensEarned * 100) / 100;
    
    if (tokensEarned > 0) {
      // Add tokens to user's balance
      user.tokens += tokensEarned;
      user.seedingStats.rewardsEarned += tokensEarned;
      
      // Add to token history
      user.tokenHistory.push({
        amount: tokensEarned,
        reason: 'Seeding reward',
        contentId,
        timestamp: new Date()
      });
    }
    
    // Update last active timestamp
    user.lastActiveAt = new Date();
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      tokensEarned,
      totalTokens: user.tokens,
      seedingStats: user.seedingStats,
      seedingRank: user.seedingRank,
      telegramData: {
        telegramId: user.telegramId,
        telegramHandle: user.telegramHandle,
        telegramUsername: user.telegramUsername
      }
    });
    
  } catch (error) {
    console.error('Error updating seeding metrics:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/metrics/user
 * @desc Get user's seeding metrics and rewards
 * @access Private
 */
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .select('tokens tokenHistory seedingStats seedingHistory lastActiveAt telegramId telegramHandle telegramUsername telegramPhotoUrl');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({
      tokens: user.tokens,
      seedingStats: user.seedingStats,
      seedingRank: user.seedingRank,
      recentHistory: user.seedingHistory.slice(-5), // Last 5 seeding sessions
      lastActiveAt: user.lastActiveAt,
      telegramData: {
        telegramId: user.telegramId,
        telegramHandle: user.telegramHandle,
        telegramUsername: user.telegramUsername,
        telegramPhotoUrl: user.telegramPhotoUrl
      }
    });
    
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/metrics/leaderboard
 * @desc Get seeding leaderboard
 * @access Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const topSeeders = await User.find({})
      .select('username telegramHandle telegramUsername telegramPhotoUrl seedingStats tokens')
      .sort({ 'tokens': -1 })
      .limit(10);
    
    return res.status(200).json({
      leaderboard: topSeeders.map(user => ({
        username: user.username,
        telegramHandle: user.telegramHandle || null,
        telegramUsername: user.telegramUsername || null,
        telegramPhotoUrl: user.telegramPhotoUrl || null,
        tokens: user.tokens,
        totalUploaded: user.seedingStats.totalBytesUploaded,
        totalSeedingTime: user.seedingStats.totalSeedingTime,
        rank: user.seedingRank
      }))
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 