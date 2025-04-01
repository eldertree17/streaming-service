const express = require('express');
const router = express.Router();
const TelegramController = require('../controllers/telegram.controller');
const telegramController = new TelegramController();

// Webhook endpoint for Telegram updates
router.post('/webhook', telegramController.handleWebhook);

// Authentication endpoint for Telegram login
router.post('/auth', telegramController.handleAuth);

// Admin endpoint to set webhook URL
router.post('/set-webhook', telegramController.setWebhook);

// Status endpoint to check bot and webhook status
router.get('/status', telegramController.getStatus);

module.exports = router; 