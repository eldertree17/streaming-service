// Telegram Mini App Integration
class TelegramApp {
    constructor() {
        this.webApp = window.Telegram?.WebApp;
        this.user = null;
        this.router = new Router();
        this.initTheme();
        this.initApp();
    }

    initApp() {
        if (!this.webApp) {
            console.warn('Telegram WebApp is not available');
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

        // Initialize router with current path
        const path = window.location.pathname;
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        this.router.navigate(path, params);

        // Update UI with user data
        this.updateUI();
    }

    initTheme() {
        if (!this.webApp) return;

        // Apply Telegram theme colors
        document.documentElement.style.setProperty('--tg-theme-bg-color', this.webApp.backgroundColor);
        document.documentElement.style.setProperty('--tg-theme-text-color', this.webApp.textColor);
        document.documentElement.style.setProperty('--tg-theme-hint-color', this.webApp.hint_color);
        document.documentElement.style.setProperty('--tg-theme-link-color', this.webApp.link_color);
        document.documentElement.style.setProperty('--tg-theme-button-color', this.webApp.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', this.webApp.button_text_color);
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
            this.webApp.BackButton.hide();
        } else {
            this.webApp.BackButton.show();
            window.history.back();
        }
    }

    // Navigation method now uses the router
    navigateTo(path, params = {}) {
        this.router.navigate(path, params);
        
        if (path !== '/' && path !== '/index.html') {
            this.webApp.BackButton.show();
        } else {
            this.webApp.BackButton.hide();
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
            telegramHandle: '@' + this.user?.username
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
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
}); 