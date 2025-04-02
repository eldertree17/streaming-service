// Authentication handling
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication buttons
    initAuthButtons();
    
    // Handle authentication callback
    handleAuthCallback();
});

function initAuthButtons() {
    const githubLoginBtn = document.getElementById('github-login');
    const telegramLoginBtn = document.getElementById('telegram-login');
    
    if (githubLoginBtn) {
        githubLoginBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`${getApiUrl()}/auth/url`);
                const data = await response.json();
                window.location.href = data.url;
            } catch (error) {
                console.error('Error getting GitHub auth URL:', error);
                showNotification('Failed to start GitHub authentication', 'error');
            }
        });
    }
    
    if (telegramLoginBtn) {
        telegramLoginBtn.addEventListener('click', () => {
            // Use existing Telegram WebApp
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
            }
        });
    }
}

function handleAuthCallback() {
    // Check if we're on the callback page
    if (window.location.pathname === '/auth/callback') {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            // Store the token
            localStorage.setItem('authToken', token);
            
            // Redirect to home page
            window.location.href = '/';
        } else {
            // Handle error
            window.location.href = '/auth/error';
        }
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('authToken');
    return !!token;
}

// Get current user data
async function getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
        const response = await fetch(`${getApiUrl()}/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            localStorage.removeItem('authToken');
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/';
}

// Helper function to get the API URL
function getApiUrl() {
    return window.StreamFlixConfig?.API_URL || '/api';
} 