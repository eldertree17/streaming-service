const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data storage
const DATA_FILE = path.join(__dirname, 'data', 'user-points.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8');
}

// Helper function to read user data
function getUserData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user data:', error);
    return {};
  }
}

// Helper function to write user data
function saveUserData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}

// API routes
app.get('/api/user/points', (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const userData = getUserData();
    
    // If user doesn't exist, return 0 points
    if (!userData[userId]) {
      return res.json({ points: 0 });
    }
    
    // Return user points
    return res.json({ points: userData[userId].points || 0 });
  } catch (error) {
    console.error('Error fetching user points:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/metrics/seeding', (req, res) => {
  try {
    const { userId, contentId, uploadSpeed, peersConnected, seedingTime } = req.body;
    
    if (!userId || !contentId) {
      return res.status(400).json({ error: 'User ID and content ID are required' });
    }
    
    // Calculate tokens earned (1 token per 50KB/s per peer, normalized to 2-second window)
    const tokensEarned = (uploadSpeed / 50) * peersConnected * (seedingTime / 2) * 0.01;
    
    // Get current user data
    const userData = getUserData();
    
    // Initialize user if not exists
    if (!userData[userId]) {
      userData[userId] = {
        points: 0,
        history: []
      };
    }
    
    // Add tokens to user
    userData[userId].points = (userData[userId].points || 0) + tokensEarned;
    
    // Add to history
    userData[userId].history = userData[userId].history || [];
    userData[userId].history.push({
      contentId,
      tokensEarned,
      uploadSpeed,
      peersConnected,
      timestamp: new Date().toISOString()
    });
    
    // Limit history to last 100 entries
    if (userData[userId].history.length > 100) {
      userData[userId].history = userData[userId].history.slice(-100);
    }
    
    // Save updated data
    saveUserData(userData);
    
    // Return success response
    return res.json({ 
      success: true, 
      tokensEarned, 
      totalPoints: userData[userId].points
    });
  } catch (error) {
    console.error('Error processing seeding metrics:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 