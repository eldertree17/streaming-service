require('dotenv').config();

module.exports = {
    telegram: {
        token: process.env.TELEGRAM_BOT_TOKEN,
        username: process.env.TELEGRAM_BOT_USERNAME
    },
    app: {
        url: process.env.APP_URL || 'http://localhost:3000'
    },
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/streamflix'
    }
}; 