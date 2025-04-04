/**
 * Global configuration settings for the streaming service
 * This file helps manage different environments (development, production)
 */

console.log('CONFIG: Loading configuration values');

// Determine the current environment
const isProduction = window.location.hostname !== 'localhost' && 
                   !window.location.hostname.includes('127.0.0.1');

// Check for Telegram Mini App
const isTelegramMiniApp = !!window.Telegram?.WebApp;

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
  
  // Environment flags
  IS_PRODUCTION: isProduction,
  IS_TELEGRAM_MINI_APP: isTelegramMiniApp,
  
  // Version string for cache busting
  VERSION: '1.0.4-debug',
  
  // Whether this is a development environment
  IS_DEVELOPMENT: !isProduction,
  
  // Default language
  DEFAULT_LANG: 'en',
  
  // Maximum number of recent watches
  MAX_RECENT_WATCHES: 10,
  
  // Debug mode - set to true to show additional debug information
  DEBUG_MODE: true
};

// Make config globally available
window.StreamFlixConfig = config;

// Log configuration in development mode
if (!isProduction) {
  console.log('StreamFlix Config:', config);
}

// For modules using import/export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}

console.log('CONFIG: Configuration loaded successfully', window.StreamFlixConfig);

// Add simple utility functions for debugging
window.debugLog = function(message, data) {
    if (window.StreamFlixConfig.DEBUG_MODE) {
        console.log('[DEBUG]', message, data || '');
        
        // Log to visual debug panel if it exists
        const debugPanel = document.getElementById('debug-status');
        if (debugPanel) {
            const now = new Date();
            const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
            debugPanel.innerHTML += `<br>[${timestamp}] ${message}`;
            debugPanel.scrollTop = debugPanel.scrollHeight;
        }
    }
};

window.debugError = function(message, error) {
    console.error('[ERROR]', message, error || '');
    
    // Log to visual debug panel if it exists
    const debugPanel = document.getElementById('debug-status');
    if (debugPanel) {
        const now = new Date();
        const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        debugPanel.innerHTML += `<br><span style="color:red">[${timestamp}] ERROR: ${message}</span>`;
        debugPanel.scrollTop = debugPanel.scrollHeight;
        debugPanel.style.display = 'block';
    }
    
    // Add a visual error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.backgroundColor = 'rgba(255,0,0,0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.width = '100%';
    errorDiv.style.textAlign = 'center';
    errorDiv.textContent = `Error: ${message}`;
    
    // If document.body exists, append the error
    if (document.body) {
        document.body.appendChild(errorDiv);
        // Auto-remove after 5 seconds
        setTimeout(() => {
            try {
                document.body.removeChild(errorDiv);
            } catch (e) {
                // Ignore errors if already removed
            }
        }, 5000);
    } else {
        // Wait for body to be available
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(errorDiv);
            // Auto-remove after 5 seconds
            setTimeout(() => {
                try {
                    document.body.removeChild(errorDiv);
                } catch (e) {
                    // Ignore errors if already removed
                }
            }, 5000);
        });
    }
}; 