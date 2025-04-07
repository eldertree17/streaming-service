/**
 * account-search.js - Telegram User Search
 * 
 * This module provides functionality for:
 * 1. Searching for users who have used this Mini App (internal directory)
 * 2. Searching for any Telegram user (via Telegram's API)
 * 3. Sending referrals to users who haven't used the app yet
 */

// Configuration
const CONFIG = {
    DEBOUNCE_TIME: 300, // ms to wait between search inputs
    MIN_SEARCH_LENGTH: 2, // minimum characters to trigger search
    API_ENDPOINT: '/api/users/search', // endpoint for searching app users
    REFERRAL_MESSAGE: 'Hey, check out this awesome streaming app! 🎬 You can join me there: https://t.me/block_stream_bot'
};

// Keep track of search timeout for debouncing
let searchTimeout = null;
let currentSearchQuery = '';
let isSearching = false;

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Telegram user search');
    
    // Initialize Telegram WebApp if available
    initTelegramWebApp();
    
    // Set up search field
    setupSearchField();
    
    // Create results container
    createSearchResultsContainer();
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
            searchField.placeholder = "Search for streamers...";
            
            // Show results container if we have a previous search
            if (currentSearchQuery.length >= CONFIG.MIN_SEARCH_LENGTH) {
                showSearchResultsContainer();
            }
        } else {
            // Let the user know this is Telegram-only
            searchField.placeholder = "Search requires Telegram app";
        }
    });
    
    // Blur event - handle losing focus
    searchField.addEventListener('blur', function(e) {
        // Don't hide results if clicking on a result
        if (e.relatedTarget && e.relatedTarget.closest('.search-results-container')) {
            return;
        }
        
        // Restore placeholder if empty
        if (!this.value.trim()) {
            searchField.placeholder = "Search Telegram users...";
        }
        
        // Hide results after a slight delay (allows for clicking on results)
        setTimeout(() => {
            if (document.activeElement !== searchField && 
                !document.activeElement.closest('.search-results-container')) {
                hideSearchResultsContainer();
            }
        }, 150);
    });
    
    // Input event - trigger search with debounce
    searchField.addEventListener('input', function() {
        const query = this.value.trim();
        currentSearchQuery = query;
        
        // Clear any pending search
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // If query is too short, hide results and do nothing
        if (query.length < CONFIG.MIN_SEARCH_LENGTH) {
            hideSearchResultsContainer();
            return;
        }
        
        // Show loading indicator
        showSearchLoadingIndicator();
        
        // Debounce the search
        searchTimeout = setTimeout(function() {
            // First try to search app users
            searchAppUsers(query);
            
            // Also search for external Telegram users if enabled
            searchExternalTelegramUsers(query);
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
        currentSearchQuery = '';
        hideSearchResultsContainer();
        searchField.focus();
    });
}

/**
 * Create container for search results
 */
function createSearchResultsContainer() {
    // Check if container already exists
    if (document.getElementById('app-users-search-results')) {
        return;
    }
    
    // Create container
    const container = document.createElement('div');
    container.id = 'app-users-search-results';
    container.className = 'search-results-container';
    container.style.display = 'none';
    
    // Positioning
    container.style.position = 'absolute';
    container.style.top = '60px'; // Below search field
    container.style.left = '10px';
    container.style.right = '10px';
    container.style.zIndex = '1000';
    container.style.backgroundColor = '#fff';
    container.style.borderRadius = '0 0 12px 12px';
    container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    container.style.maxHeight = '70vh';
    container.style.overflowY = 'auto';
    container.style.padding = '8px 0';
    
    // Append to body
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(container);
    } else {
        document.body.appendChild(container);
    }
}

/**
 * Show search loading indicator
 */
function showSearchLoadingIndicator() {
    const container = document.getElementById('app-users-search-results');
    if (!container) return;
    
    container.innerHTML = `
        <div class="search-loading" style="text-align: center; padding: 16px; color: #888;">
            <i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>
            Searching streamers...
        </div>
    `;
    
    showSearchResultsContainer();
}

/**
 * Show search results container
 */
function showSearchResultsContainer() {
    const container = document.getElementById('app-users-search-results');
    if (container) {
        container.style.display = 'block';
    }
}

/**
 * Hide search results container
 */
function hideSearchResultsContainer() {
    const container = document.getElementById('app-users-search-results');
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Search for users who have used this app
 * @param {string} query - The search query
 */
function searchAppUsers(query) {
    isSearching = true;
    console.log('Searching app users for:', query);
    
    // In a real implementation, this would be an API call to the backend
    // For demo purposes, simulate with local data
    
    // For testing: Simulate network delay
    setTimeout(() => {
        try {
            // Mock data - in a real app this would come from your backend
            const mockUsers = [
                {
                    id: '123456789',
                    firstName: 'Emma',
                    lastName: 'Stone',
                    username: 'emmastone',
                    photoUrl: 'https://i.pravatar.cc/150?u=emma',
                    dvdCount: 250,
                    hasUsedApp: true
                },
                {
                    id: '987654321',
                    firstName: 'Ryan',
                    lastName: 'Reynolds',
                    username: 'ryanreynolds',
                    photoUrl: 'https://i.pravatar.cc/150?u=ryan',
                    dvdCount: 315,
                    hasUsedApp: true
                },
                {
                    id: '456789123',
                    firstName: 'Jennifer',
                    lastName: 'Lawrence',
                    username: 'jlaw',
                    photoUrl: 'https://i.pravatar.cc/150?u=jen',
                    dvdCount: 178,
                    hasUsedApp: true
                }
            ];
            
            // Simple filtering matching name or username
            const filteredUsers = mockUsers.filter(user => {
                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                const username = user.username.toLowerCase();
                const searchTerm = query.toLowerCase();
                
                return fullName.includes(searchTerm) || username.includes(searchTerm);
            });
            
            // Display matching users
            displaySearchResults(filteredUsers);
            
            // Show Telegram search option if no results or few results
            if (filteredUsers.length === 0) {
                addTelegramSearchOption(query);
            }
            
            isSearching = false;
        } catch (error) {
            console.error('Error searching app users:', error);
            displaySearchError('Failed to search users');
            isSearching = false;
        }
    }, 500);  // Simulate a network delay
}

/**
 * Search for users in Telegram who haven't used the app
 * @param {string} query - The search query
 */
function searchExternalTelegramUsers(query) {
    console.log('Searching external Telegram users for:', query);
    
    // In a real implementation, this would be an API call to your backend
    // which would use Telegram's Bot API to search for users
    
    // For demo purposes, we'll add some mock external users
    setTimeout(() => {
        try {
            // Mock data - in a real app this would come from your backend via Telegram Bot API
            const mockExternalUsers = [
                {
                    id: '111222333',
                    firstName: 'Tom',
                    lastName: 'Hanks',
                    username: 'tomhanks',
                    photoUrl: 'https://i.pravatar.cc/150?u=tom',
                    hasUsedApp: false
                },
                {
                    id: '444555666',
                    firstName: 'Emma',
                    lastName: 'Watson',
                    username: 'emmawatson',
                    photoUrl: 'https://i.pravatar.cc/150?u=emmaw',
                    hasUsedApp: false
                },
                {
                    id: '777888999',
                    firstName: 'Chris',
                    lastName: 'Evans',
                    username: 'chrisevans',
                    photoUrl: 'https://i.pravatar.cc/150?u=chris',
                    hasUsedApp: false
                }
            ];
            
            // Simple filtering matching name or username
            const filteredUsers = mockExternalUsers.filter(user => {
                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                const username = user.username.toLowerCase();
                const searchTerm = query.toLowerCase();
                
                return fullName.includes(searchTerm) || username.includes(searchTerm);
            });
            
            // Append external users to the results (if any)
            if (filteredUsers.length > 0) {
                appendExternalSearchResults(filteredUsers);
            }
        } catch (error) {
            console.error('Error searching external Telegram users:', error);
        }
    }, 800); // Slightly longer delay to ensure internal users show first
}

/**
 * Display search results in the container
 * @param {Array} users - Array of user objects
 */
function displaySearchResults(users) {
    const container = document.getElementById('app-users-search-results');
    if (!container) return;
    
    // Clear previous results
    container.innerHTML = '';
    
    // If no users found, show message
    if (!users || users.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 16px; color: #888;">
                No streamers found
            </div>
        `;
        return;
    }
    
    // Add section title for app users
    const titleElement = document.createElement('div');
    titleElement.innerHTML = `
        <div style="padding: 8px 16px; font-weight: 500; color: #888; font-size: 13px; text-transform: uppercase;">
            App Users
        </div>
    `;
    container.appendChild(titleElement);
    
    // Create results list
    const list = document.createElement('ul');
    list.id = 'app-users-list';
    list.style.listStyle = 'none';
    list.style.margin = '0';
    list.style.padding = '0';
    
    // Add each user to the list
    users.forEach(user => {
        const item = document.createElement('li');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '10px 16px';
        item.style.cursor = 'pointer';
        item.style.transition = 'background-color 0.2s';
        
        // Hover effect
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = '#f5f5f5';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
        });
        
        // Click to navigate to user profile
        item.addEventListener('click', () => {
            navigateToUserProfile(user);
        });
        
        // User avatar
        item.innerHTML = `
            <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; margin-right: 12px;">
                <img src="${user.photoUrl}" alt="${user.firstName}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 500; font-size: 15px;">${user.firstName} ${user.lastName}</div>
                <div style="font-size: 13px; color: #888;">@${user.username} · ${user.dvdCount} DVDs</div>
            </div>
        `;
        
        list.appendChild(item);
    });
    
    container.appendChild(list);
}

/**
 * Append external Telegram users to search results
 * @param {Array} users - Array of external user objects
 */
function appendExternalSearchResults(users) {
    if (!users || users.length === 0) return;
    
    const container = document.getElementById('app-users-search-results');
    if (!container) return;
    
    // Check if we have any existing results
    const hasExistingResults = container.querySelector('#app-users-list') !== null;
    
    // Add divider if we already have results
    if (hasExistingResults) {
        const divider = document.createElement('div');
        divider.style.margin = '8px 0';
        divider.style.borderTop = '1px solid #eee';
        container.appendChild(divider);
    }
    
    // Add section title for external users
    const titleElement = document.createElement('div');
    titleElement.innerHTML = `
        <div style="padding: 8px 16px; font-weight: 500; color: #888; font-size: 13px; text-transform: uppercase;">
            Invite to App
        </div>
    `;
    container.appendChild(titleElement);
    
    // Create results list for external users
    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.margin = '0';
    list.style.padding = '0';
    
    // Add each external user to the list
    users.forEach(user => {
        const item = document.createElement('li');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '10px 16px';
        item.style.cursor = 'pointer';
        item.style.transition = 'background-color 0.2s';
        
        // Hover effect
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = '#f5f5f5';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
        });
        
        // Click to send referral
        item.addEventListener('click', () => {
            sendReferralToUser(user);
        });
        
        // User avatar with refer badge
        item.innerHTML = `
            <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; margin-right: 12px; position: relative;">
                <img src="${user.photoUrl}" alt="${user.firstName}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; bottom: -2px; right: -2px; background-color: #4CAF50; color: white; font-size: 10px; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-paper-plane" style="font-size: 8px;"></i>
                </div>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 500; font-size: 15px;">${user.firstName} ${user.lastName}</div>
                <div style="font-size: 13px; color: #888;">@${user.username}</div>
            </div>
        `;
        
        list.appendChild(item);
    });
    
    container.appendChild(list);
}

/**
 * Add option to search for user in Telegram
 * @param {string} query - The search query
 */
function addTelegramSearchOption(query) {
    const container = document.getElementById('app-users-search-results');
    if (!container) return;
    
    // Create divider
    const divider = document.createElement('div');
    divider.style.margin = '8px 16px';
    divider.style.borderTop = '1px solid #eee';
    container.appendChild(divider);
    
    // Create Telegram search option
    const telegramOption = document.createElement('div');
    telegramOption.style.display = 'flex';
    telegramOption.style.alignItems = 'center';
    telegramOption.style.padding = '16px';
    telegramOption.style.cursor = 'pointer';
    telegramOption.style.color = '#0088cc'; // Telegram blue
    
    // Click to search in Telegram
    telegramOption.addEventListener('click', () => {
        performTelegramSearch(query);
    });
    
    telegramOption.innerHTML = `
        <i class="fab fa-telegram" style="font-size: 20px; margin-right: 12px;"></i>
        <div>
            <div style="font-weight: 500;">Search "${query}" in Telegram</div>
            <div style="font-size: 13px; color: #888;">Find users who haven't used this app yet</div>
        </div>
    `;
    
    container.appendChild(telegramOption);
}

/**
 * Navigate to a user's profile page
 * @param {Object} user - User object with id, name, etc.
 */
function navigateToUserProfile(user) {
    console.log('Navigating to user profile:', user);
    
    if (!user.hasUsedApp) {
        // If user hasn't used the app, send a referral instead
        sendReferralToUser(user);
        return;
    }
    
    // Hide search results
    hideSearchResultsContainer();
    
    // In a real implementation, this would navigate to a profile page
    // For now, just simulate with an alert
    showSuccessToast(`Navigating to ${user.firstName} ${user.lastName}'s profile`);
    
    // Example of how to navigate (uncomment and modify as needed)
    window.location.href = `/profile.html?user_id=${user.id}`;
}

/**
 * Send a referral to a user who hasn't used the app
 * @param {Object} user - User object to send referral to
 */
function sendReferralToUser(user) {
    console.log('Sending referral to user:', user);
    
    // Hide search results
    hideSearchResultsContainer();
    
    // Check if Telegram WebApp is available
    if (window.Telegram && window.Telegram.WebApp) {
        try {
            // Use Telegram's openLink to open a conversation with the user if available
            const username = user.username;
            if (username && typeof window.Telegram.WebApp.openLink === 'function') {
                // Generate referral link with message
                const referralMessage = encodeURIComponent(CONFIG.REFERRAL_MESSAGE);
                const telegramLink = `https://t.me/${username}?start=invite`;
                
                window.Telegram.WebApp.openLink(telegramLink);
                
                // Show success message
                showSuccessToast(`Opening chat with ${user.firstName}`);
                return;
            }
            
            // Fallback to switchInlineQuery if available
            if (typeof window.Telegram.WebApp.switchInlineQuery === 'function') {
                window.Telegram.WebApp.switchInlineQuery(CONFIG.REFERRAL_MESSAGE, [user.username]);
                showSuccessToast(`Ready to send invitation to ${user.firstName}`);
                return;
            }
            
            // Ultimate fallback
            showSuccessToast(`To invite ${user.firstName}, send them this link: t.me/block_stream_bot`);
            
        } catch (error) {
            console.error('Error sending referral:', error);
            showSuccessToast(`Copy this link to invite: t.me/block_stream_bot`);
        }
    } else {
        // Fallback for testing outside Telegram
        alert(`Would send a referral to ${user.firstName} ${user.lastName} via Telegram`);
    }
}

/**
 * Show a success toast notification
 * @param {string} message - Message to display
 */
function showSuccessToast(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.left = '50%';
        toastContainer.style.transform = 'translateX(-50%)';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.style.backgroundColor = '#4CAF50';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '4px';
    toast.style.marginBottom = '10px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.minWidth = '250px';
    toast.style.textAlign = 'center';
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    
    // Add message
    toast.textContent = message;
    
    // Add to container and animate in
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Display search error
 * @param {string} message - Error message
 */
function displaySearchError(message) {
    const container = document.getElementById('app-users-search-results');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 16px; color: #e74c3c;">
            <i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>
            ${message}
        </div>
    `;
}

/**
 * Perform a Telegram user search using WebApp methods
 * @param {string} query - The search query
 */
function performTelegramSearch(query) {
    console.log('Performing Telegram search for:', query);
    
    // Hide the search results container
    hideSearchResultsContainer();
    
    if (window.Telegram && window.Telegram.WebApp) {
        try {
            // Check if we can use openLink (available in most versions)
            if (typeof window.Telegram.WebApp.openLink === 'function') {
                // Use direct Telegram search URL
                const searchUrl = `https://t.me/search?query=${encodeURIComponent(query)}`;
                window.Telegram.WebApp.openLink(searchUrl);
                return;
            }
            
            // If openLink is not available, try switchInlineQuery
            if (typeof window.Telegram.WebApp.switchInlineQuery === 'function') {
                window.Telegram.WebApp.switchInlineQuery(query);
                return;
            }
            
            // Ultimate fallback - at least show a toast
            showSuccessToast(`To find "${query}", use Telegram's main search feature`);
            
        } catch (error) {
            console.error('Error with Telegram search:', error);
            // Fallback to a simple message
            showSuccessToast(`To find "${query}", please use Telegram's main search`);
        }
    } else {
        // Not running in Telegram
        alert('This feature is only available when running inside the Telegram app.');
    }
}

// Expose necessary functions
window.TelegramUserSearch = {
    search: performTelegramSearch,
    searchAppUsers: searchAppUsers,
    sendReferral: sendReferralToUser
}; 