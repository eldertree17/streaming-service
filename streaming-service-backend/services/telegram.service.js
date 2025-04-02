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
        
        // Check if we're in development mode
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (isDevelopment) {
            // Use polling for development
            console.log('Development mode detected, using polling instead of webhook');
            this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
            console.log('Bot initialized in polling mode for development');
        } else {
            // Use webhook for production
            console.log('Production mode detected, using webhook');
            this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
            
            // Set webhook
            const webhookUrl = `${process.env.APP_URL}/api/telegram/webhook`;
            this.bot.setWebHook(webhookUrl).then(() => {
                console.log('Webhook set successfully to:', webhookUrl);
            }).catch(error => {
                console.error('Error setting webhook:', error);
            });
            
            console.log('Bot initialized in webhook mode for production');
        }

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
                
                // Check if we're in development mode
                const isDevelopment = process.env.NODE_ENV === 'development';
                
                if (isDevelopment) {
                    // In development, don't use buttons for localhost URLs
                    await this.bot.sendMessage(
                        query.message.chat.id,
                        '🎬 Here\'s your link to watch Big Buck Bunny:\n\n' +
                        `${watchUrl}\n\n` +
                        'Note: In production, this would be a clickable button.',
                        { 
                            disable_web_page_preview: true
                        }
                    );
                } else {
                    // In production, use clickable URL button
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
                { command: '/watch', description: 'Open streaming app' },
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
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        let welcomeMessage = `Welcome to Block Stream! 🎬\n\n`
            + `I'm your streaming assistant. Here's what I can help you with:\n\n`
            + `🎥 /watch - Open streaming app\n`
            + `💰 /points - Check your points\n`
            + `🔗 /refer - Get referral links\n`
            + `❓ /help - See all commands\n\n`;
        
        if (isDevelopment) {
            welcomeMessage += `For development testing, use the commands above.`;
        } else {
            welcomeMessage += `To start watching, click the Menu button and select Block Stream, or use the /watch command!`;
        }

        await this.bot.sendMessage(chatId, welcomeMessage);
    }

    async handleWatch(msg) {
        const chatId = msg.chat.id;
        
        // Check if we're in development mode
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (isDevelopment) {
            // In development, don't use buttons for localhost URLs - use text only
            await this.bot.sendMessage(
                chatId,
                '🎬 Welcome to Block Stream!\n\n' +
                'For development testing, please visit:\n\n' +
                `${process.env.APP_URL}\n\n` +
                'In production, this would open the Telegram Mini App.'
            );
        } else {
            // In production, use web_app button (requires HTTPS)
            await this.bot.sendMessage(
                chatId,
                '🎬 Welcome to Block Stream!\n\n' +
                'Click the button below to start watching:',
                {
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '▶️ Open Streaming App', web_app: { url: process.env.APP_URL } }
                        ]]
                    }
                }
            );
        }
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
            + `🎥 /watch - Open streaming app\n`
            + `💰 /points - Check points\n`
            + `🔗 /refer - Get referral links\n`
            + `❓ /help - Show this help message\n\n`
            + `You can also access the streaming app through the Menu button!`;

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
        // Use APP_URL from environment instead of hardcoded ngrok URL
        const authUrl = `${process.env.APP_URL}/auth/telegram?token=${loginToken}`;
        
        // Check if we're in development mode
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (isDevelopment) {
            // In development, don't use buttons for localhost URLs
            await this.bot.sendMessage(
                chatId,
                `🔑 Please connect your account first!\n\n` +
                `For development testing, please use this URL to connect:\n\n` +
                `${authUrl}\n\n` +
                `Note: In production, this would be a clickable button.`,
                { 
                    disable_web_page_preview: true
                }
            );
        } else {
            // In production, use clickable URL button
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
}

module.exports = TelegramService; 