const express = require('express');
const router = express.Router();
const githubController = require('../controllers/github.controller');

// Get GitHub OAuth URL
router.get('/auth/url', githubController.getAuthUrl);

// GitHub OAuth callback
router.get('/auth/github/callback', githubController.handleCallback);

module.exports = router; 