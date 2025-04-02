/**
 * Global configuration settings for the streaming service
 * This file helps manage different environments (development, production)
 */

// Determine the current environment
const isProduction = window.location.hostname !== 'localhost' && 
                   !window.location.hostname.includes('127.0.0.1');

// Configuration object
const config = {
  // BACKEND API base URL
  // In production, this needs to be a publicly accessible HTTPS server (not GitHub Pages)
  // GitHub Pages can only serve static content, not run a backend server
  API_URL: isProduction 
    ? 'https://streamflix-backend.onrender.com/api'  // Render-hosted backend API URL
    : 'http://localhost:5006/api',
    
  // FRONTEND URL settings (for the Telegram Mini App)
  FRONTEND: {
    // Base URL for the frontend application - GitHub Pages URL in production
    APP_URL: isProduction
      ? 'https://eldertree17.github.io/streaming-service'  // Your GitHub Pages URL for static frontend
      : 'http://localhost:5006'
  },
  
  // Environment flag
  IS_PRODUCTION: isProduction
};

// Make config globally available
window.StreamFlixConfig = config;

// For modules using import/export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} 