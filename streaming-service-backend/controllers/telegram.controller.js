const TelegramService = require('../services/telegram.service');
const TelegramUser = require('../models/telegram-user.model');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let telegramServiceInstance = null;

class TelegramController {
    constructor() {
        if (!telegramServiceInstance) {
            telegramServiceInstance = new TelegramService();
        }
        this.telegramService = telegramServiceInstance;
        this.bot = this.telegramService.bot;

        // Bind methods to this instance
        this.handleWebhook = this.handleWebhook.bind(this);
        this.handleAuth = this.handleAuth.bind(this);
        this.setWebhook = this.setWebhook.bind(this);
        this.getStatus = this.getStatus.bind(this);
    }

    async handleWebhook(req, res) {
        try {
            // Process incoming webhook data
            const update = req.body;
            
            // Log webhook update for debugging
            console.log('Received Telegram webhook update:', update);

            // Forward the update to the bot instance
            if (this.telegramService && this.telegramService.bot) {
                if (!update) {
                    console.error('No update data received in webhook');
                    return res.sendStatus(400);
                }

                await this.bot.processUpdate(update);
                console.log('Successfully processed webhook update');
                res.sendStatus(200);
            } else {
                console.error('Telegram service or bot not initialized');
                res.sendStatus(500);
            }
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.sendStatus(500);
        }
    }

    async handleAuth(req, res) {
        try {
            const { token } = req.query;
            
            if (!token) {
                return res.status(400).json({ error: 'No token provided' });
            }

            // Find user by login token
            const telegramUser = await TelegramUser.findOne({
                loginToken: token,
                loginTokenExpires: { $gt: new Date() }
            });

            if (!telegramUser) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            // Get the associated user
            const user = await User.findById(telegramUser.userId);
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Clear the login token
            telegramUser.loginToken = null;
            telegramUser.loginTokenExpires = null;
            await telegramUser.save();

            // Generate JWT token
            const jwtToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Send success response with JWT
            res.json({
                token: jwtToken,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Error handling auth:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async setWebhook(req, res) {
        try {
            const url = `${process.env.APP_URL}/api/telegram/webhook`;
            await this.bot.setWebHook(url);
            res.json({ success: true, message: 'Webhook set successfully' });
        } catch (error) {
            console.error('Error setting webhook:', error);
            res.status(500).json({ error: 'Failed to set webhook' });
        }
    }

    async getStatus(req, res) {
        try {
            const webhookInfo = await this.bot.getWebHookInfo();
            res.json({
                status: 'ok',
                webhook: webhookInfo,
                botInfo: await this.bot.getMe()
            });
        } catch (error) {
            console.error('Error getting status:', error);
            res.status(500).json({ error: 'Failed to get status' });
        }
    }
}

module.exports = TelegramController; 