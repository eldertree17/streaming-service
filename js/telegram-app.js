// Telegram Mini App Integration
class TelegramApp {
    constructor() {
        this.webApp = window.Telegram?.WebApp;
        this.user = null;
        this.router = new Router();
        this.initTheme();
        this.initApp();
        
        // Add a flag to indicate this is running as a mini app
        window.IS_TELEGRAM_MINI_APP = true;
    }

    initApp() {
        if (!this.webApp) {
            console.warn('Telegram WebApp is not available');
            // Add fallback behavior for browser testing
            this.simulateTelegramApp();
            return;
        }

        // Initialize the WebApp
        this.webApp.ready();
        this.webApp.expand();

        // Get user data
        this.user = this.webApp.initDataUnsafe?.user || null;
        console.log('Telegram user:', this.user);

        // Set up back button handling
        this.webApp.BackButton.onClick(() => this.handleBackButton());
        
        // Handle theme changes
        this.webApp.onEvent('themeChanged', () => this.initTheme());

        // Force navigation to home page for initial load
        this.navigateTo('/', {});

        // Update UI with user data
        this.updateUI();
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

    // Navigation method now uses the router
    navigateTo(path, params = {}) {
        // Override the router's navigate method to prevent conflicts
        if (document.querySelector('.app-container')) {
            // Clear the app container to prevent flickering
            document.querySelector('.app-container').innerHTML = '';
        }
        
        this.router.navigate(path, params);
        
        if (this.webApp) {
            if (path !== '/' && path !== '/index.html') {
                this.webApp.BackButton.show();
            } else {
                this.webApp.BackButton.hide();
            }
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
    console.log("Initializing Telegram Mini App");
    
    // Add loading indicator to body
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.style.display = 'none';
    loadingIndicator.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingIndicator);

    // Add error message container
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'none';
    document.body.appendChild(errorMessage);

    // Initialize Telegram App
    window.telegramApp = new TelegramApp();
    
    // Override any conflicting initializations
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(event, handler, options) {
        // Prevent other DOMContentLoaded handlers from running
        if (event === 'DOMContentLoaded' && handler.toString().includes('setupMovieItemClicks')) {
            console.log('Preventing conflicting initialization');
            return;
        }
        return originalAddEventListener.call(this, event, handler, options);
    };
}); 