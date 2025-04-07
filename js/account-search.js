/**
 * account-search.js - Telegram User Search
 * 
 * This module provides a clean, simple interface for searching Telegram users
 * by integrating directly with Telegram's native search functionality.
 */

// Configuration
const CONFIG = {
    DEBOUNCE_TIME: 300, // ms to wait between search inputs
    MIN_SEARCH_LENGTH: 2 // minimum characters to trigger search
};

// Keep track of search timeout for debouncing
let searchTimeout = null;

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Telegram user search');
    
    // Initialize Telegram WebApp if available
    initTelegramWebApp();
    
    // Set up search field
    setupSearchField();
});

/**
 * Initialize the Telegram WebApp integration
 */
function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        console.log('Telegram WebApp found, initializing...');
        
        // Tell Telegram that the Mini App is ready
        window.Telegram.WebApp.ready();
        
        // Expand to full height for better UI
        window.Telegram.WebApp.expand();
        
        console.log('Telegram WebApp initialized');
    } else {
        console.warn('Telegram WebApp not available. User search requires the Telegram app.');
    }
}

/**
 * Set up the search field with event listeners
 */
function setupSearchField() {
    const searchField = document.querySelector('.search-field input');
    
    if (!searchField) {
        console.error('Search field not found in the DOM');
        return;
    }
    
    // Focus event - prepare for search
    searchField.addEventListener('focus', function() {
        if (window.Telegram && window.Telegram.WebApp) {
            // Let the user know they can search
            searchField.placeholder = "Type to search Telegram users...";
        } else {
            // Let the user know this is Telegram-only
            searchField.placeholder = "Search requires Telegram app";
        }
    });
    
    // Blur event - restore placeholder
    searchField.addEventListener('blur', function() {
        if (!this.value.trim()) {
            searchField.placeholder = "Search Telegram users...";
        }
    });
    
    // Input event - trigger search with debounce
    searchField.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Clear any pending search
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // If query is too short, do nothing
        if (query.length < CONFIG.MIN_SEARCH_LENGTH) {
            return;
        }
        
        // Debounce the search
        searchTimeout = setTimeout(function() {
            openTelegramSearch(query);
        }, CONFIG.DEBOUNCE_TIME);
    });
    
    // Add a clear button to the search field
    addSearchClearButton(searchField);
}

/**
 * Add a clear button to the search field
 */
function addSearchClearButton(searchField) {
    // Create clear button if it doesn't exist
    let clearButton = document.querySelector('.search-clear-btn');
    
    if (!clearButton) {
        clearButton = document.createElement('i');
        clearButton.className = 'fas fa-times search-clear-btn';
        clearButton.style.display = 'none';
        
        // Insert after the input field
        searchField.parentNode.insertBefore(clearButton, searchField.nextSibling);
    }
    
    // Show/hide clear button based on input content
    searchField.addEventListener('input', function() {
        clearButton.style.display = this.value.length > 0 ? 'block' : 'none';
    });
    
    // Clear search when clear button is clicked
    clearButton.addEventListener('click', function() {
        searchField.value = '';
        clearButton.style.display = 'none';
        searchField.focus();
    });
}

/**
 * Open Telegram's native search interface
 * @param {string} query - The search query
 */
function openTelegramSearch(query) {
    console.log('Opening Telegram search for:', query);
    
    if (window.Telegram && window.Telegram.WebApp) {
        try {
            // Tell Telegram to open its native search interface
            // Using the Telegram deep link protocol to open user search
            window.Telegram.WebApp.openTelegramLink(`tg://search?query=${encodeURIComponent(query)}`);
        } catch (error) {
            console.error('Error opening Telegram search:', error);
            alert('Unable to open Telegram search. Please make sure you are using the latest version of Telegram.');
        }
    } else {
        alert('This feature is only available when running inside the Telegram app.');
    }
}

// Expose only the necessary function
window.TelegramUserSearch = {
    openSearch: openTelegramSearch
}; 