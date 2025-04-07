// Telegram Mini App Integration
class TelegramApp {
    constructor() {
        console.log('TelegramApp constructor starting');
        
        // Use the already initialized WebApp from the initialization script
        this.webApp = window.Telegram?.WebApp;
        this.user = null;
        this.userPoints = 0; // Initialize user points
        
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
                
                // Load user points from local storage if available
                this.loadUserPoints();
            } catch (e) {
                console.error('Error retrieving user data:', e);
            }
        } else {
            console.log('Telegram WebApp not available, running in browser mode');
            // Create fallback for browser testing
            this.simulateTelegramApp();
            
            // Load points for simulated user
            this.loadUserPoints();
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
            const accountItem = document.querySelector('.nav-item#nav-account');
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
    
    // Add points to user's account
    addPoints(points) {
        console.log(`Adding ${points} points to user ${this.user?.id || 'unknown'}`);
        
        if (!points || isNaN(points) || points <= 0) {
            console.warn('Invalid points value:', points);
            return 0;
        }
        
        // Add points to user's total
        this.userPoints += points;
        
        // Save updated points to storage
        this.saveUserPoints();
        
        // Notify Telegram about points update (if connected)
        this.notifyTelegramPointsUpdate();
        
        console.log(`User now has ${this.userPoints} total points`);
        return this.userPoints;
    }
    
    // Get user's current points
    getPoints() {
        return this.userPoints;
    }
    
    // Save user points to local storage
    saveUserPoints() {
        try {
            const userId = this.user?.id || 'browser-test-user';
            const storageKey = `streamflix_points_${userId}`;
            localStorage.setItem(storageKey, this.userPoints.toString());
            console.log(`Saved ${this.userPoints} points for user ${userId}`);
        } catch (e) {
            console.error('Error saving user points:', e);
        }
    }
    
    // Load user points from local storage
    loadUserPoints() {
        try {
            const userId = this.user?.id || 'browser-test-user';
            const storageKey = `streamflix_points_${userId}`;
            const storedPoints = localStorage.getItem(storageKey);
            
            if (storedPoints !== null) {
                this.userPoints = parseInt(storedPoints, 10);
                console.log(`Loaded ${this.userPoints} points for user ${userId}`);
            } else {
                console.log(`No stored points found for user ${userId}`);
                this.userPoints = 0;
            }
        } catch (e) {
            console.error('Error loading user points:', e);
            this.userPoints = 0;
        }
    }
    
    // Notify Telegram about points update
    notifyTelegramPointsUpdate() {
        if (!this.webApp) {
            console.log('Telegram WebApp not available, skipping points notification');
            return;
        }
        
        try {
            // Use Telegram's CloudStorage if available to store points
            if (this.webApp.CloudStorage) {
                const userData = {
                    points: this.userPoints,
                    lastUpdated: new Date().toISOString()
                };
                
                this.webApp.CloudStorage.setItem('user_points', JSON.stringify(userData), (error, success) => {
                    if (error) {
                        console.error('Error storing points in Telegram Cloud:', error);
                    } else {
                        console.log('Points successfully stored in Telegram Cloud');
                    }
                });
            } else {
                console.log('Telegram CloudStorage not available');
            }
            
            // Send data back to Telegram Bot
            if (this.webApp.sendData) {
                const data = JSON.stringify({
                    action: 'update_points',
                    points: this.userPoints,
                    userId: this.user?.id,
                    timestamp: new Date().toISOString()
                });
                
                console.log('Sending points data to Telegram:', data);
                this.webApp.sendData(data);
            }
        } catch (e) {
            console.error('Error notifying Telegram about points update:', e);
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