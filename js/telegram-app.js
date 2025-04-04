// Telegram Mini App Integration
class TelegramApp {
    constructor() {
        console.log('TelegramApp constructor starting');
        
        // Check if WebApp is already initialized by the early initialization script
        this.webApp = window.Telegram?.WebApp;
        
        // If we already have the WebApp from early initialization
        if (this.webApp) {
            console.log('Using already initialized Telegram WebApp');
        } else {
            console.log('Telegram WebApp not found, app will run in browser mode');
        }
        
        this.user = null;
        
        try {
            this.router = new Router();
            console.log('Router initialized successfully');
        } catch (e) {
            console.error('Failed to initialize Router:', e);
            return;
        }
        
        // Initialize the app
        this.initTheme();
        this.initApp();
        
        // Flag indicating this is running as a mini app
        window.IS_TELEGRAM_MINI_APP = !!this.webApp;
    }

    initApp() {
        if (!this.webApp) {
            console.warn('Telegram WebApp is not available');
            // Add fallback behavior for browser testing
            this.simulateTelegramApp();
            return;
        }

        try {
            // Note: We don't need to call ready() or expand() again
            // since we already did in the early initialization script
            // this.webApp.ready();
            // this.webApp.expand();

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

    // Initialize theme based on Telegram settings
    initTheme() {
        if (!this.webApp) return;
        
        const colorScheme = this.webApp.colorScheme || 'light';
        document.documentElement.setAttribute('data-theme', colorScheme);
        
        // Apply Telegram theme colors if available
        const themeParams = this.webApp.themeParams || {};
        if (themeParams) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '');
            document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '');
            document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '');
            document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color || '');
            document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color || '');
            document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '');
        }
    }

    // Handle back button press
    handleBackButton() {
        console.log('Back button pressed');
        this.navigateTo('/');
    }

    // Navigation method using router
    navigateTo(path, params = {}) {
        console.log('TelegramApp.navigateTo called with path:', path, 'params:', params);
        
        try {
            // Call the router's navigateTo method
            if (this.router && typeof this.router.navigateTo === 'function') {
                console.log('Calling router.navigateTo');
                this.router.navigateTo(path, params);
            } else {
                console.error('Router or navigateTo method not available');
            }
            
            // Manage back button visibility
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
        }
    }

    // Update UI based on user data
    updateUI() {
        // Update navigation elements
        const accountItem = document.querySelector('.nav-item a[href="pages/account.html"]');
        if (accountItem && this.user) {
            accountItem.querySelector('p').textContent = this.user.first_name || 'Account';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - Initializing Telegram Mini App");
    
    try {
        // Initialize Telegram App
        window.telegramApp = new TelegramApp();
        console.log("Telegram Mini App initialized successfully");
    } catch (e) {
        console.error("Failed to initialize Telegram Mini App:", e);
    }
}); 