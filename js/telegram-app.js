// Telegram Mini App Integration
class TelegramApp {
    constructor() {
        console.log('TelegramApp constructor starting');
        
        // Use the already initialized WebApp from the initialization script
        this.webApp = window.Telegram?.WebApp;
        this.user = null;
        
        // Check if Telegram WebApp is available and initialized
        if (this.webApp) {
            console.log('Using pre-initialized Telegram WebApp');
            
            // Log WebApp version and initialization data
            console.log('WebApp version:', this.webApp.version);
            console.log('WebApp platform:', this.webApp.platform);
            
            // Get the initialization parameters from the Telegram
            try {
                this.user = this.webApp.initDataUnsafe?.user || null;
                console.log('User data retrieved:', this.user);
            } catch (e) {
                console.error('Error retrieving user data:', e);
            }
        } else {
            console.log('Telegram WebApp not available, running in browser mode');
            // Create fallback for browser testing
            this.simulateTelegramApp();
        }
        
        try {
            // Initialize router
            this.router = new Router();
            console.log('Router initialized successfully');
            
            // Initialize theme
            this.initTheme();
            
            // Setup additional handlers
            this.setupHandlers();
            
            console.log('TelegramApp initialization complete');
        } catch (e) {
            console.error('Error during TelegramApp initialization:', e);
        }
    }
    
    // Setup Telegram-specific handlers
    setupHandlers() {
        if (!this.webApp) return;
        
        try {
            // Setup back button handler
            this.webApp.BackButton.onClick(() => this.handleBackButton());
            console.log('Back button handler set up');
            
            // Handle theme changes
            this.webApp.onEvent('themeChanged', () => this.initTheme());
            console.log('Theme change handler set up');
            
            // Set up main button if needed
            if (this.webApp.MainButton) {
                this.webApp.MainButton.setText('Watch Movie');
                this.webApp.MainButton.onClick(() => {
                    console.log('Main button clicked');
                    // Logic for main button click
                });
                console.log('Main button set up');
            }
        } catch (e) {
            console.error('Error setting up Telegram handlers:', e);
        }
    }
    
    // Fallback for browser testing
    simulateTelegramApp() {
        console.log("Creating browser test environment");
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
        
        try {
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
            
            console.log('Theme initialized with color scheme:', colorScheme);
        } catch (e) {
            console.error('Error initializing theme:', e);
        }
    }
    
    // Handle back button press
    handleBackButton() {
        console.log('Back button pressed');
        this.navigateTo('/');
    }
    
    // Navigation using router
    navigateTo(path, params = {}) {
        console.log('Navigating to:', path, params);
        
        try {
            // Use the router to navigate
            if (this.router && typeof this.router.navigateTo === 'function') {
                this.router.navigateTo(path, params);
            } else {
                console.error('Router navigation not available');
            }
            
            // Update back button visibility
            if (this.webApp) {
                if (path === '/' || path === '/index.html') {
                    this.webApp.BackButton.hide();
                } else {
                    this.webApp.BackButton.show();
                }
            }
        } catch (e) {
            console.error('Navigation error:', e);
        }
    }
    
    // Update UI with user data
    updateUI() {
        try {
            // Update account tab with user name if available
            const accountItem = document.querySelector('.nav-item a[href="pages/account.html"]');
            if (accountItem && this.user) {
                const nameElement = accountItem.querySelector('p');
                if (nameElement) {
                    nameElement.textContent = this.user.first_name || 'Account';
                }
            }
            
            // If we have a user, log analytics
            if (this.user) {
                console.log('Logging user session:', this.user.id);
                // Additional analytics tracking could be added here
            }
        } catch (e) {
            console.error('Error updating UI:', e);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing TelegramApp');
    
    try {
        // Create the TelegramApp instance
        window.telegramApp = new TelegramApp();
        
        // Navigate to home page
        if (window.telegramApp) {
            window.telegramApp.navigateTo('/', {});
            window.telegramApp.updateUI();
        }
        
        // Log initialization success to StreamFlix logger
        if (window.StreamFlix && window.StreamFlix.log) {
            window.StreamFlix.log('TelegramApp initialized successfully');
        }
    } catch (e) {
        console.error('Error creating TelegramApp:', e);
        
        // Log error to StreamFlix logger
        if (window.StreamFlix && window.StreamFlix.error) {
            window.StreamFlix.error('Failed to initialize TelegramApp: ' + e.message);
        }
    }
}); 