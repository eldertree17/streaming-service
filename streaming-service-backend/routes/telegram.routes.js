const express = require('express');
const router = express.Router();
const TelegramController = require('../controllers/telegram.controller');
const telegramController = new TelegramController();

// Webhook endpoint for Telegram updates
router.post('/webhook', (req, res) => {
    try {
        telegramController.bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.sendStatus(500);
    }
});

// Authentication endpoint for Telegram login
router.post('/auth', telegramController.handleAuth);

// Admin endpoint to set webhook URL
router.post('/set-webhook', telegramController.setWebhook);

router.get('/status', telegramController.getStatus);

module.exports = router; 