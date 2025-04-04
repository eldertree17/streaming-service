// Telegram Mini App Integration
class TelegramApp {
    constructor() {
        console.log('TelegramApp constructor starting');
        
        // Check if Telegram object exists before trying to access it
        if (typeof window.Telegram === 'undefined') {
            console.error('CRITICAL ERROR: Telegram object is not defined');
            this.showFatalError('Telegram object not available. This app must be run inside Telegram.');
            return;
        }
        
        console.log('Telegram object exists:', window.Telegram);
        
        // Check if WebApp object exists
        if (!window.Telegram.WebApp) {
            console.error('CRITICAL ERROR: Telegram.WebApp object is not defined');
            this.showFatalError('Telegram.WebApp object not available. This app must be run inside Telegram.');
            return;
        }
        
        console.log('Telegram.WebApp object exists:', window.Telegram.WebApp);
        
        this.webApp = window.Telegram.WebApp;
        this.user = null;
        
        // Initialize router after ensuring WebApp is available
        try {
            this.router = new Router();
            console.log('Router initialized successfully');
        } catch (e) {
            console.error('Failed to initialize Router:', e);
            this.showFatalError('Failed to initialize Router: ' + e.message);
            return;
        }
        
        // Set up initialization promise
        this.initPromise = new Promise((resolve, reject) => {
            try {
                this.initTheme();
                console.log('Theme initialized');
                
                this.initApp();
                console.log('App initialization completed');
                
                // Add a flag to indicate this is running as a mini app
                window.IS_TELEGRAM_MINI_APP = true;
                
                resolve(this);
            } catch (e) {
                console.error('Error during initialization:', e);
                this.showFatalError('Initialization error: ' + e.message);
                reject(e);
            }
        });
        
        // Handle initialization completion
        this.initPromise
            .then(() => console.log('TelegramApp fully initialized'))
            .catch(err => console.error('TelegramApp initialization failed:', err));
    }

    showFatalError(message) {
        // Create visible error message for fatal errors
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.backgroundColor = 'red';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '20px';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.width = '100%';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.fontSize = '16px';
        errorDiv.innerHTML = `<strong>ERROR:</strong> ${message}<br>Please try restarting the app.`;
        
        // Ensure body exists before appending
        if (document.body) {
            document.body.appendChild(errorDiv);
        } else {
            // If body doesn't exist yet, wait for it
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(errorDiv);
            });
        }
    }

    initApp() {
        if (!this.webApp) {
            console.warn('Telegram WebApp is not available');
            // Add fallback behavior for browser testing
            this.simulateTelegramApp();
            return;
        }

        try {
            // Initialize the WebApp
            console.log('Calling WebApp.ready()');
            this.webApp.ready();
            
            console.log('Calling WebApp.expand()');
            this.webApp.expand();

            // Get user data
            console.log('Getting user data from initDataUnsafe');
            this.user = this.webApp.initDataUnsafe?.user || null;
            console.log('Telegram user:', this.user);

            // Set up back button handling
            console.log('Setting up back button handler');
            this.webApp.BackButton.onClick(() => this.handleBackButton());
            
            // Handle theme changes
            console.log('Setting up theme change handler');
            this.webApp.onEvent('themeChanged', () => this.initTheme());

            // Force navigation to home page for initial load
            console.log('Navigating to home page');
            this.navigateTo('/', {});

            // Update UI with user data
            console.log('Updating UI with user data');
            this.updateUI();
            
            console.log('App initialization completed successfully');
        } catch (e) {
            console.error('Error in initApp:', e);
            this.showFatalError('Error initializing app: ' + e.message);
        }
    }
    
    // Fallback for testing outside Telegram
    simulateTelegramApp() {
        console.log("Running in browser mode (not Telegram)");
        this.user = {
            id: "browser-test-user",
            username: "test_user",
            first_name: "Test",
            last_name: "User"
        };
    }

    initTheme() {
        if (!this.webApp) return;

        // Apply Telegram theme colors
        document.documentElement.style.setProperty('--tg-theme-bg-color', this.webApp.backgroundColor || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', this.webApp.textColor || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', this.webApp.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', this.webApp.link_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-color', this.webApp.button_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', this.webApp.button_text_color || '#ffffff');
    }

    updateUI() {
        if (!this.user) return;

        // Update user-related UI elements
        const userElements = document.querySelectorAll('[data-telegram-user]');
        userElements.forEach(element => {
            const field = element.dataset.telegramUser;
            if (this.user[field]) {
                element.textContent = this.user[field];
            }
        });

        // Update profile image if available
        const profileImages = document.querySelectorAll('[data-telegram-photo]');
        profileImages.forEach(img => {
            if (this.user.photo_url) {
                img.src = this.user.photo_url;
            }
        });
    }

    handleBackButton() {
        const currentPath = window.location.pathname;
        
        if (currentPath === '/' || currentPath === '/index.html') {
            if (this.webApp) this.webApp.BackButton.hide();
        } else {
            if (this.webApp) this.webApp.BackButton.show();
            window.history.back();
        }
    }

    // Navigation method now uses the router's navigateTo method
    navigateTo(path, params = {}) {
        console.log('TelegramApp.navigateTo called with path:', path, 'params:', params);
        
        try {
            // Override the router's navigate method to prevent conflicts
            if (document.querySelector('.app-container')) {
                // Clear the app container to prevent flickering
                document.querySelector('.app-container').innerHTML = '';
            }
            
            // Call the router's navigateTo method instead of navigate
            if (this.router && typeof this.router.navigateTo === 'function') {
                console.log('Calling router.navigateTo');
                this.router.navigateTo(path, params);
            } else {
                console.error('Router or navigateTo method not available');
                window.debugError?.('Router navigation failed: router.navigateTo not available');
            }
            
            if (this.webApp) {
                if (path !== '/' && path !== '/index.html') {
                    console.log('Showing back button');
                    this.webApp.BackButton.show();
                } else {
                    console.log('Hiding back button');
                    this.webApp.BackButton.hide();
                }
            }
        } catch (error) {
            console.error('Navigation error in TelegramApp:', error);
            window.debugError?.('Navigation error: ' + error.message, error);
        }
    }

    // Share content using Telegram's native sharing
    shareContent(title, text) {
        if (!this.webApp) return;
        this.webApp.switchInlineQuery(text, ['users', 'groups']);
    }

    // Get user data for API calls
    getUserData() {
        return {
            telegramId: this.user?.id,
            telegramUsername: this.user?.username,
            telegramPhotoUrl: this.user?.photo_url,
            telegramHandle: this.user?.username ? '@' + this.user?.username : null
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - Initializing Telegram Mini App");
    
    // Add loading indicator to body
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.style.display = 'block'; // Show immediately
    loadingIndicator.innerHTML = '<div class="spinner"></div><div>Loading application...</div>';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '0';
    loadingIndicator.style.left = '0';
    loadingIndicator.style.width = '100%';
    loadingIndicator.style.height = '100%';
    loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.display = 'flex';
    loadingIndicator.style.flexDirection = 'column';
    loadingIndicator.style.alignItems = 'center';
    loadingIndicator.style.justifyContent = 'center';
    loadingIndicator.style.zIndex = '9998';
    document.body.appendChild(loadingIndicator);

    // Add error message container
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'none';
    document.body.appendChild(errorMessage);

    try {
        console.log("Creating Telegram App instance");
        // Initialize Telegram App
        window.telegramApp = new TelegramApp();
        
        // Hide loading indicator after 2 seconds to ensure app had time to initialize
        setTimeout(() => {
            loadingIndicator.style.display = 'none';
        }, 2000);
    } catch (e) {
        console.error("Failed to create TelegramApp instance:", e);
        loadingIndicator.innerHTML = `<div class="spinner"></div><div>Error: ${e.message}</div>`;
    }
    
    console.log("DOMContentLoaded handler completed");
}); 