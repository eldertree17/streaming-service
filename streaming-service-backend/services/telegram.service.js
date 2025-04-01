const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

class TelegramService {
    constructor() {
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
        }
        if (!process.env.APP_URL) {
            throw new Error('APP_URL environment variable is not set');
        }

        console.log('Initializing TelegramService with token:', this.maskToken(process.env.TELEGRAM_BOT_TOKEN));
        console.log('Using APP_URL:', process.env.APP_URL);
        
        const options = {
            webHook: {
                port: process.env.PORT || 10000
            }
        };

        // Initialize bot with webhook for production
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, options);
        
        // Set webhook
        const webhookUrl = `${process.env.APP_URL}/api/telegram/webhook`;
        this.bot.setWebHook(webhookUrl).then(() => {
            console.log('Webhook set successfully to:', webhookUrl);
        }).catch(error => {
            console.error('Error setting webhook:', error);
        });

        console.log('Bot initialized in webhook mode');

        // Add error handler
        this.bot.on('error', (error) => {
            console.error('Telegram Bot Error:', error);
        });

        // Handle all message types
        this.bot.on('message', async (msg) => {
            console.log('Received message:', msg);
            
            // Handle commands
            if (msg.text && msg.text.startsWith('/')) {
                const command = msg.text.split(' ')[0]; // Get the command part
                console.log('Processing command:', command);
                
                switch (command) {
                    case '/start':
                        await this.handleStart(msg);
                        break;
                    case '/login':
                        await this.handleLogin(msg);
                        break;
                    case '/watch':
                        await this.handleWatch(msg);
                        break;
                    case '/points':
                        await this.handlePoints(msg);
                        break;
                    case '/refer':
                        await this.handleRefer(msg);
                        break;
                    case '/help':
                        await this.handleHelp(msg);
                        break;
                }
            }
            
            // Handle web app data
            if (msg.web_app_data) {
                console.log('Received web app data:', msg.web_app_data);
                await this.handleWatch(msg);
            }
        });

        // Handle callback queries (button clicks)
        this.bot.on('callback_query', async (query) => {
            console.log('Received callback query:', query);
            
            if (query.data === 'watch_bbb') {
                const isAuthenticated = await this.checkUserAuth(query.message.chat.id);
                
                if (!isAuthenticated) {
                    await this.promptLogin(query.message.chat.id);
                    return;
                }

                const watchUrl = `${process.env.APP_URL}/pages/watch?id=bbb&from=telegram`;
                
                // Send watch link for Big Buck Bunny
                await this.bot.sendMessage(
                    query.message.chat.id,
                    '🎬 Here\'s your link to watch Big Buck Bunny:\n' +
                    watchUrl,
                    { 
                        disable_web_page_preview: true,
                        reply_markup: {
                            inline_keyboard: [[
                                { text: '▶️ Watch Now', url: watchUrl }
                            ]]
                        }
                    }
                );
            }
        });

        this.setupCommands();
    }

    maskToken(token) {
        if (!token) return 'undefined';
        return token.substring(0, 6) + '...' + token.substring(token.length - 4);
    }

    async setupCommands() {
        console.log('Setting up bot commands...');
        try {
            // Set up bot commands
            await this.bot.setMyCommands([
                { command: '/start', description: 'Start the bot and get introduction' },
                { command: '/login', description: 'Generate authentication link' },
                { command: '/watch', description: 'List available content' },
                { command: '/points', description: 'Check points balance and history' },
                { command: '/refer', description: 'Generate referral links' },
                { command: '/help', description: 'List available commands' }
            ]);
            console.log('Bot commands set up successfully');
        } catch (error) {
            console.error('Error setting up commands:', error);
        }
    }

    async handleStart(msg) {
        const chatId = msg.chat.id;
        const welcomeMessage = `Welcome to Block Stream! 🎬\n\n`
            + `I'm your streaming assistant. Here's what I can help you with:\n\n`
            + `🔑 /login - Connect your account\n`
            + `🎥 /watch - Browse available content\n`
            + `💰 /points - Check your points\n`
            + `🔗 /refer - Get referral links\n`
            + `❓ /help - See all commands\n\n`
            + `To get started, use /login to connect your account.`;

        await this.bot.sendMessage(chatId, welcomeMessage);
    }

    async handleLogin(msg) {
        const chatId = msg.chat.id;
        // Generate a unique login link
        const loginToken = await this.generateLoginToken(chatId);
        const authUrl = `https://7e03-119-237-115-84.ngrok-free.app/auth/telegram?token=${loginToken}`;

        await this.bot.sendMessage(
            chatId,
            `Click the link below to connect your account:\n${authUrl}`,
            { disable_web_page_preview: true }
        );
    }

    async handleWatch(msg) {
        const chatId = msg.chat.id;
        
        // Check if user is authenticated
        const isAuthenticated = await this.checkUserAuth(chatId);
        
        if (!isAuthenticated) {
            await this.promptLogin(chatId);
            return;
        }

        // If authenticated, show content
        await this.bot.sendMessage(
            chatId,
            '🎬 Here\'s what you can watch:\n\n' +
            '1. Big Buck Bunny\n' +
            '2. More content coming soon!\n\n' +
            'Select a title to start watching:',
            {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🎥 Big Buck Bunny', callback_data: 'watch_bbb' }
                    ]]
                }
            }
        );
    }

    async handlePoints(msg) {
        const chatId = msg.chat.id;
        // TODO: Implement points checking
        await this.bot.sendMessage(
            chatId,
            'Coming soon: Check your points balance and history!'
        );
    }

    async handleRefer(msg) {
        const chatId = msg.chat.id;
        // TODO: Implement referral system
        await this.bot.sendMessage(
            chatId,
            'Coming soon: Generate and share your referral links!'
        );
    }

    async handleHelp(msg) {
        const chatId = msg.chat.id;
        const helpMessage = `Available commands:\n\n`
            + `🚀 /start - Start the bot\n`
            + `🔑 /login - Connect your account\n`
            + `🎥 /watch - Browse content\n`
            + `💰 /points - Check points\n`
            + `🔗 /refer - Get referral links\n`
            + `❓ /help - Show this help message`;

        await this.bot.sendMessage(chatId, helpMessage);
    }

    async generateLoginToken(chatId) {
        // TODO: Implement secure token generation
        return Buffer.from(`${chatId}-${Date.now()}`).toString('base64');
    }

    async checkUserAuth(chatId) {
        try {
            const telegramUser = await require('../models/telegram-user.model').findOne({ chatId });
            return !!telegramUser;
        } catch (error) {
            console.error('Error checking user auth:', error);
            return false;
        }
    }

    async promptLogin(chatId) {
        const loginToken = await this.generateLoginToken(chatId);
        const authUrl = `https://7e03-119-237-115-84.ngrok-free.app/auth/telegram?token=${loginToken}`;
        
        const keyboard = {
            inline_keyboard: [
                [{ text: '🔗 Connect Account', url: authUrl }]
            ]
        };

        await this.bot.sendMessage(
            chatId,
            `🔑 Please connect your account first!\n\nClick the link below to connect:\n${authUrl}`,
            { 
                disable_web_page_preview: true,
                reply_markup: keyboard
            }
        );
    }
}

module.exports = TelegramService; 