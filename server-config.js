/**
 * URL Redirection Server Configuration
 * 
 * This file provides URL handling for clean URLs without .html extensions
 * Redirects /pages/*.html to /pages/* for all pages
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const port = process.env.PORT || 5003;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Generic handler for any .html URLs - redirect to clean URLs
app.get('/pages/*.html', (req, res) => {
    const requestPath = req.path;
    const cleanPath = requestPath.replace('.html', '');
    const queryString = Object.keys(req.query).length 
        ? '?' + new URLSearchParams(req.query).toString() 
        : '';
    
    console.log(`Redirecting from ${requestPath} to ${cleanPath}${queryString}`);
    res.redirect(301, cleanPath + queryString);
});

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// API endpoint for content/video that matches what watch.js expects
app.get('/api/content/video', (req, res) => {
    console.log('Serving sample video content API endpoint');
    // This matches the sample content from streaming-service-backend/routes/content.js
    const sampleContent = {
      _id: "sample-video-1",
      title: "Big Buck Bunny",
      description: "Big Buck Bunny is a short animated film by the Blender Institute, part of the Blender Foundation. It's a public domain test video that's widely used for testing video players.",
      posterImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
      magnetLink: "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent",
      telegramChannelId: "@bigbuckbunny",
      genre: ["Animation", "Short", "Comedy", "Public Domain"],
      releaseYear: 2008,
      duration: "9m 56s",
      likes: 9999,
      dislikes: 0,
      createdAt: new Date()
    };
    
    res.json(sampleContent);
});

// Add metrics API endpoints
app.post('/api/metrics/seeding', (req, res) => {
    console.log('Metrics seeding endpoint accessed:', req.body);
    
    // Mock response with simulated tokens and stats
    const tokensEarned = Math.random() * 5; // Random number between 0-5
    
    res.json({
        success: true,
        tokensEarned,
        totalTokens: 100 + tokensEarned,
        seedingStats: {
            totalBytesUploaded: 1024 * 1024 * (10 + Math.floor(Math.random() * 100)),
            totalSeedingTime: 3600 + Math.floor(Math.random() * 3600),
            totalPeersServed: 5 + Math.floor(Math.random() * 20),
            activeSeedingCount: 1,
            rewardsEarned: 150 + tokensEarned,
            contentSeeded: 1
        },
        seedingRank: "Gold",
        telegramData: {
            telegramId: null,
            telegramHandle: null,
            telegramUsername: null
        }
    });
});

app.get('/api/metrics/user', (req, res) => {
    console.log('Metrics user endpoint accessed');
    
    res.json({
        tokens: 100,
        seedingStats: {
            totalBytesUploaded: 1024 * 1024 * 100,
            totalSeedingTime: 7200,
            totalPeersServed: 25,
            activeSeedingCount: 1,
            rewardsEarned: 150,
            contentSeeded: 1
        },
        seedingRank: "Gold",
        recentHistory: [
            {
                contentId: "sample-video-1",
                title: "Big Buck Bunny",
                startTime: new Date(Date.now() - 3600000),
                bytesUploaded: 1024 * 1024 * 50,
                duration: 3600,
                peers: 5
            }
        ],
        lastActiveAt: new Date(),
        telegramData: {
            telegramId: null,
            telegramHandle: null,
            telegramUsername: null,
            telegramPhotoUrl: null
        }
    });
});

app.get('/api/metrics/leaderboard', (req, res) => {
    console.log('Metrics leaderboard endpoint accessed');
    
    res.json({
        leaderboard: [
            {
                username: "demo_user",
                telegramHandle: null,
                telegramUsername: null,
                telegramPhotoUrl: null,
                tokens: 150,
                totalUploaded: 1024 * 1024 * 100,
                totalSeedingTime: 7200,
                rank: "Gold"
            }
        ]
    });
});

// Handle all clean URLs for pages
app.get('/pages/:page', (req, res) => {
    const pageName = req.params.page;
    const filePath = path.join(__dirname, 'pages', `${pageName}.html`);
    
    // Check if the file exists
    if (fs.existsSync(filePath)) {
        console.log(`Serving ${filePath} for clean URL /pages/${pageName}`);
        fs.createReadStream(filePath).pipe(res);
    } else {
        console.log(`File not found: ${filePath}`);
        res.status(404).send('Page not found');
    }
});

// Add index redirect
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 