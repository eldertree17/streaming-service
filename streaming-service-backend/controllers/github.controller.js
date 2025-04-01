const githubService = require('../services/github.service');

class GitHubController {
    async getAuthUrl(req, res) {
        try {
            const authUrl = githubService.getAuthUrl();
            res.json({ url: authUrl });
        } catch (error) {
            console.error('Error generating GitHub auth URL:', error);
            res.status(500).json({ error: 'Failed to generate authentication URL' });
        }
    }

    async handleCallback(req, res) {
        try {
            const { code } = req.query;
            
            if (!code) {
                return res.status(400).json({ error: 'No code provided' });
            }

            const result = await githubService.handleCallback(code);
            
            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.token}`);
        } catch (error) {
            console.error('Error handling GitHub callback:', error);
            res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
        }
    }
}

module.exports = new GitHubController(); 