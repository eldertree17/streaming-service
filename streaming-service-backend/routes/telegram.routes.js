const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegram.controller');

// Webhook endpoint for Telegram updates
router.post('/webhook', telegramController.handleWebhook);

// Authentication endpoint for Telegram login
router.get('/auth', telegramController.handleAuth);

// Admin endpoint to set webhook URL
router.post('/set-webhook', telegramController.setWebhook);

module.exports = router; 