/**
 * account-search.js - Telegram User Search Functionality
 * 
 * This module handles the search functionality for finding Telegram users
 * directly from our app, connecting to Telegram's native search capabilities.
 * 
 * Features:
 * - Integration with Telegram WebApp API
 * - User-only filtering (no bots, channels, or groups)
 * - Navigation to user profiles
 * - Debounced search to prevent excessive API calls
 */

// Configuration
const CONFIG = {
    DEBOUNCE_TIME: 300, // ms to wait between search inputs
    MIN_SEARCH_LENGTH: 2, // minimum characters to trigger search
    MAX_RESULTS: 20 // maximum results to display
};

// Cache for search results
let searchCache = {};

// Keep track of current search state
let currentSearchQuery = '';
let isSearching = false;
let searchTimeout = null;

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Telegram user search');
    
    // Initialize Telegram WebApp if available
    initTelegramWebApp();
    
    // Set up search field
    setupSearchField();
    
    // Set up results container
    createResultsContainer();
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
        console.log('Telegram WebApp not available, running in browser mode');
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
    
    // Focus event - expand search UI
    searchField.addEventListener('focus', function() {
        document.body.classList.add('search-active');
        showResultsContainer();
    });
    
    // Input event - trigger search with debounce
    searchField.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Clear any pending search
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Update current query
        currentSearchQuery = query;
        
        // If query is too short, clear results
        if (query.length < CONFIG.MIN_SEARCH_LENGTH) {
            clearSearchResults();
            return;
        }
        
        // Show loading indicator
        showLoadingIndicator();
        
        // Debounce the search
        searchTimeout = setTimeout(function() {
            searchTelegramUsers(query);
        }, CONFIG.DEBOUNCE_TIME);
    });
    
    // Add a close button to the search field
    addSearchCloseButton(searchField);
}

/**
 * Add a close button to the search field
 */
function addSearchCloseButton(searchField) {
    // Create close button if it doesn't exist
    let closeButton = document.querySelector('.search-close-btn');
    
    if (!closeButton) {
        closeButton = document.createElement('i');
        closeButton.className = 'fas fa-times search-close-btn';
        closeButton.style.display = 'none';
        
        // Insert after the input field
        searchField.parentNode.insertBefore(closeButton, searchField.nextSibling);
    }
    
    // Show/hide close button based on input content
    searchField.addEventListener('input', function() {
        closeButton.style.display = this.value.length > 0 ? 'block' : 'none';
    });
    
    // Clear search when close button is clicked
    closeButton.addEventListener('click', function() {
        searchField.value = '';
        closeButton.style.display = 'none';
        clearSearchResults();
        hideResultsContainer();
        document.body.classList.remove('search-active');
    });
}

/**
 * Create the container for search results
 */
function createResultsContainer() {
    // Check if it already exists
    let resultsContainer = document.getElementById('telegram-search-results');
    
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'telegram-search-results';
        resultsContainer.className = 'telegram-search-results';
        resultsContainer.style.display = 'none';
        
        // Add to the DOM after the search container
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.parentNode.insertBefore(resultsContainer, searchContainer.nextSibling);
        } else {
            // Fallback - add to body
            document.body.appendChild(resultsContainer);
        }
    }
}

/**
 * Show the results container
 */
function showResultsContainer() {
    const resultsContainer = document.getElementById('telegram-search-results');
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
    }
}

/**
 * Hide the results container
 */
function hideResultsContainer() {
    const resultsContainer = document.getElementById('telegram-search-results');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
}

/**
 * Show loading indicator in the results container
 */
function showLoadingIndicator() {
    const resultsContainer = document.getElementById('telegram-search-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Searching Telegram users...</div>';
    }
}

/**
 * Clear search results
 */
function clearSearchResults() {
    const resultsContainer = document.getElementById('telegram-search-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

/**
 * Search for Telegram users using the WebApp API
 * @param {string} query - The search query
 */
function searchTelegramUsers(query) {
    // Check if we have cached results
    if (searchCache[query]) {
        console.log('Using cached results for:', query);
        displaySearchResults(searchCache[query]);
        return;
    }
    
    console.log('Searching Telegram users for:', query);
    isSearching = true;
    
    // Check if we have access to the Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        // Use Telegram's WebApp API to search for users
        // The exact API call depends on what Telegram provides
        
        // For demonstration, we'll use a simulated API call
        // In a real implementation, this would use Telegram's actual API
        simulateSearch(query).then(results => {
            // Cache the results
            searchCache[query] = results;
            
            // Display results only if this is still the current query
            if (currentSearchQuery === query) {
                displaySearchResults(results);
            }
            
            isSearching = false;
        }).catch(error => {
            console.error('Error searching Telegram users:', error);
            showSearchError(error);
            isSearching = false;
        });
    } else {
        // Telegram WebApp is not available, show error
        showSearchError('Telegram integration not available. Please open this in the Telegram app.');
        isSearching = false;
    }
}

/**
 * Simulate a search (for development/testing)
 * In a real implementation, this would be replaced with actual Telegram API calls
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Promise resolving to an array of user results
 */
function simulateSearch(query) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Generate fake results based on query
            const results = [];
            
            // Only generate results if query is meaningful
            if (query.length >= CONFIG.MIN_SEARCH_LENGTH) {
                // Generate between 0 and 10 results
                const numResults = Math.floor(Math.random() * 10);
                
                for (let i = 0; i < numResults; i++) {
                    results.push({
                        id: `user_${i}_${Date.now()}`,
                        username: `${query}_user_${i}`,
                        first_name: `${query.charAt(0).toUpperCase()}${query.slice(1)}`,
                        last_name: `User ${i}`,
                        photo_url: `https://i.pravatar.cc/150?u=${query}${i}`,
                        type: 'user' // This ensures we only get users, not bots/channels/groups
                    });
                }
            }
            
            resolve(results);
        }, 700); // Simulate network delay
    });
}

/**
 * Display search results in the results container
 * @param {Array} results - Array of user results
 */
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('telegram-search-results');
    
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // If no results, show message
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No Telegram users found</div>';
        return;
    }
    
    // Create results list
    const resultsList = document.createElement('ul');
    resultsList.className = 'search-results-list';
    
    // Add each result as a list item
    results.forEach(user => {
        if (user.type === 'user') { // Only include users, not bots/channels/groups
            const listItem = document.createElement('li');
            listItem.className = 'search-result-item';
            listItem.dataset.userId = user.id;
            
            // Create HTML for the user
            listItem.innerHTML = `
                <div class="search-result-avatar">
                    <img src="${user.photo_url || '../img/default-avatar.png'}" alt="${user.first_name}">
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${user.first_name} ${user.last_name || ''}</div>
                    ${user.username ? `<div class="search-result-username">@${user.username}</div>` : ''}
                </div>
            `;
            
            // Add click event to navigate to user profile
            listItem.addEventListener('click', function() {
                navigateToUserProfile(user);
            });
            
            resultsList.appendChild(listItem);
        }
    });
    
    // Add the list to the container
    resultsContainer.appendChild(resultsList);
}

/**
 * Navigate to a user's profile
 * @param {Object} user - The user object
 */
function navigateToUserProfile(user) {
    console.log('Navigating to user profile:', user);
    
    // In a real implementation, this would use Telegram's navigation APIs
    if (window.Telegram && window.Telegram.WebApp) {
        // Use Telegram to open the user's profile
        // The exact method depends on what Telegram provides in their WebApp API
        
        // For demonstration purposes:
        console.log(`Would navigate to Telegram user: ${user.first_name} ${user.last_name || ''} (@${user.username})`);
        
        // This is where we would implement the actual navigation
        // Example (hypothetical - actual implementation depends on Telegram's API):
        // window.Telegram.WebApp.openTelegramProfile(user.username);
    } else {
        // Fallback for browser testing
        alert(`Would navigate to profile of: ${user.first_name} ${user.last_name || ''} (@${user.username})`);
    }
}

/**
 * Show search error message
 * @param {string} message - The error message
 */
function showSearchError(message) {
    const resultsContainer = document.getElementById('telegram-search-results');
    
    if (resultsContainer) {
        resultsContainer.innerHTML = `<div class="search-error">${message}</div>`;
    }
}

// Expose functions for use in other modules
window.TelegramUserSearch = {
    search: searchTelegramUsers,
    clearResults: clearSearchResults,
    showResults: showResultsContainer,
    hideResults: hideResultsContainer
}; 