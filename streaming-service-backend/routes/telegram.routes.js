const express = require('express');
const router = express.Router();
const TelegramController = require('../controllers/telegram.controller');

// Create an instance of the controller
const telegramController = new TelegramController();

// Status endpoint to check bot status
router.get('/status', telegramController.getStatus);

// Reset webhook - explicit endpoint to fix webhook issues
router.post('/reset-webhook', telegramController.resetWebhook);

// Webhook endpoint for Telegram
router.post('/webhook', telegramController.handleWebhook);

// Authentication endpoint for Telegram login
router.post('/auth', telegramController.handleAuth);

// Admin endpoint to set webhook URL
router.post('/set-webhook', telegramController.setWebhook);

// Get detailed webhook status
router.get('/webhook-status', telegramController.getWebhookStatus);

module.exports = router; 