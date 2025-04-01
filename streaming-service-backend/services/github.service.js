const axios = require('axios');
const config = require('../config/github');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

class GitHubService {
    constructor() {
        if (!config.clientId || !config.clientSecret) {
            throw new Error('GitHub OAuth credentials not configured');
        }
    }

    getAuthUrl() {
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.callbackURL,
            scope: config.scope.join(' '),
            state: this.generateState()
        });

        return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }

    generateState() {
        return Math.random().toString(36).substring(7);
    }

    async handleCallback(code) {
        try {
            // Exchange code for access token
            const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
                client_id: config.clientId,
                client_secret: config.clientSecret,
                code: code,
                redirect_uri: config.callbackURL
            }, {
                headers: {
                    Accept: 'application/json'
                }
            });

            const { access_token } = tokenResponse.data;

            // Get user data from GitHub
            const userResponse = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${access_token}`
                }
            });

            const { id, login, email, avatar_url } = userResponse.data;

            // Find or create user
            let user = await User.findOne({ 'github.id': id });

            if (!user) {
                user = new User({
                    username: login,
                    email: email,
                    profileImage: avatar_url,
                    github: {
                        id: id,
                        username: login,
                        email: email,
                        avatar: avatar_url
                    }
                });
                await user.save();
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage
                }
            };
        } catch (error) {
            console.error('GitHub authentication error:', error);
            throw error;
        }
    }
}

module.exports = new GitHubService(); 