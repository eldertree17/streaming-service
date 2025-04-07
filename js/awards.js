/**
 * awards.js - Functionality for the awards section
 *
 * Handles all awards-related functionality including:
 * - Loading and displaying film awards in carousel
 * - Displaying film awards in modal
 * - Managing telegram profile (for user's seeding rewards)
 * - Displaying leaderboard
 * - Showing seeding rewards information
 */

// Initialize awards functionality when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing awards module');
    populateAwardsCarousel();
    setupAwardsHandlers();
    
    // Load saved metrics immediately to display tokens/stats
    try {
        const metricsJson = localStorage.getItem('user_metrics');
        if (metricsJson) {
            const metrics = JSON.parse(metricsJson);
            console.log('Found saved user metrics on page load:', metrics);
            
            // Store tokens from previous session
            if (metrics.tokens && !isNaN(metrics.tokens)) {
                window.totalTokensEarned = metrics.tokens;
                console.log('Initialized totalTokensEarned from stored metrics:', window.totalTokensEarned);
                
                // Update the UI to display the tokens
                const earningRate = document.getElementById('earning-rate');
                if (earningRate) {
                    earningRate.textContent = Math.round(window.totalTokensEarned);
                }
            }
        }
    } catch (error) {
        console.error('Error loading saved metrics on initialization:', error);
    }
    
    // Then fetch fresh metrics from the server
    fetchUserMetrics().then(metrics => {
        updateRewardsUI(metrics);
    }).catch(error => {
        console.error('Error fetching user metrics:', error);
    });
    
    setupViewStatsButton();
});

/**
 * Sets up event handlers for awards-related functionality
 */
function setupAwardsHandlers() {
    // Set up button click handlers in the rewards modal
    const rewardsModal = document.getElementById('rewards-modal');
    if (rewardsModal) {
        const leaderboardBtn = rewardsModal.querySelector('#leaderboard-btn');
        const rewardInfoBtn = rewardsModal.querySelector('#reward-info-btn');
        
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', async function() {
                const leaderboard = await fetchLeaderboard();
                showLeaderboardModal(leaderboard);
            });
        }
        
        if (rewardInfoBtn) {
            rewardInfoBtn.addEventListener('click', showRewardInfo);
        }
    }
    
    // Set up film awards modal open behavior
    const filmAwardsButton = document.querySelector('[data-modal="film-awards-modal"]');
    if (filmAwardsButton) {
        filmAwardsButton.addEventListener('click', function() {
            const modal = document.getElementById('film-awards-modal');
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                
                // Populate the film awards grid with more detailed info
                populateFilmAwardsModal();
            }
        });
    }
    
    // Set up rewards modal open behavior (separate from film awards)
    // This is for the user's seeding rewards, not the film awards
    const awardsButton = document.querySelector('[data-modal="rewards-modal"]');
    if (awardsButton) {
        awardsButton.addEventListener('click', function() {
            const modal = document.getElementById('rewards-modal');
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                
                // Fetch and display user metrics
                fetchUserMetrics().then(updateRewardsUI);
                setupTelegramForm();
            }
        });
    }
    
    // Set up the "View Awards" button in the torrent stats section
    const viewStatsBtn = document.getElementById('btn-view-stats');
    if (viewStatsBtn) {
        viewStatsBtn.addEventListener('click', function() {
            const rewardsModal = document.getElementById('rewards-modal');
            if (rewardsModal) {
                rewardsModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                
                // Fetch and update metrics
                fetchUserMetrics().then(updateRewardsUI);
                setupTelegramForm();
            }
        });
    }
}

/**
 * Populates the awards carousel with film awards data
 */
function populateAwardsCarousel() {
    // Try to find the carousel with the awards-carousel class
    let awardsCarousel = document.querySelector('.awards-carousel');
    
    // Check if awards carousel exists before attempting to manipulate it
    if (!awardsCarousel) {
        console.log('Awards carousel element not found, skipping population');
        return;
    }
    
    // Clear existing content
    awardsCarousel.innerHTML = '';
    
    // In a real app, this would fetch data from an API
    // For demo, we'll use mock data
    const filmAwardsData = getFilmAwardsData();
    
    // Populate awards carousel with a subset of the awards
    filmAwardsData.slice(0, 4).forEach(award => {
        const awardItem = document.createElement('div');
        awardItem.className = 'reward-item';
        
        awardItem.innerHTML = `
            <img src="${award.image}" alt="${award.name}">
            <div class="reward-name">${award.name}</div>
            <div class="reward-description">${award.category}</div>
        `;
        
        awardsCarousel.appendChild(awardItem);
    });
}

/**
 * Populates the film awards modal with all awards data
 */
function populateFilmAwardsModal() {
    const filmAwardsGrid = document.querySelector('.film-awards-grid');
    if (!filmAwardsGrid) {
        console.log('Film awards grid not found');
        return;
    }
    
    // Clear existing content
    filmAwardsGrid.innerHTML = '';
    
    // Get film awards data
    const filmAwardsData = getFilmAwardsData();
    
    // Populate the grid with all awards and more detailed information
    filmAwardsData.forEach(award => {
        const awardItem = document.createElement('div');
        awardItem.className = 'film-award-item';
        
        awardItem.innerHTML = `
            <div class="award-image">
                <img src="${award.image}" alt="${award.name}">
            </div>
            <div class="award-details">
                <h3 class="award-name">${award.name}</h3>
                <div class="award-category">${award.category}</div>
                <div class="award-year">${award.year}</div>
                ${award.recipient ? `<div class="award-recipient">Awarded to: ${award.recipient}</div>` : ''}
                ${award.description ? `<p class="award-description">${award.description}</p>` : ''}
            </div>
        `;
        
        filmAwardsGrid.appendChild(awardItem);
    });
}

/**
 * Returns film awards data
 */
function getFilmAwardsData() {
    // In a real app, this would be fetched from an API based on the current movie
    return [
        {
            name: "Academy Award (Oscar)",
            category: "Best Original Screenplay",
            year: "2023",
            recipient: "Jane Smith",
            description: "Recognizing outstanding writing achievements in motion pictures.",
            image: "https://images.unsplash.com/photo-1598394888170-951386e28d98"
        },
        {
            name: "Golden Globe",
            category: "Best Motion Picture - Drama",
            year: "2023",
            recipient: null, // For the whole film
            description: "Honoring the best in film and television, voted by the Hollywood Foreign Press Association.",
            image: "https://images.unsplash.com/photo-1604076913837-52ab5629fba9"
        },
        {
            name: "BAFTA",
            category: "Best Production Design",
            year: "2023",
            recipient: "John Johnson",
            description: "Celebrating the very best in film from the past year.",
            image: "https://images.unsplash.com/photo-1579087528039-2d3eda4fb5d5"
        },
        {
            name: "Saturn Award",
            category: "Best Science Fiction Film",
            year: "2023",
            recipient: null,
            description: "Honoring the best in science fiction, fantasy, and horror film and television.",
            image: "https://images.unsplash.com/photo-1579087528039-2d3eda4fb5d5"
        },
        {
            name: "Critics' Choice Movie Award",
            category: "Best Cinematography",
            year: "2023",
            recipient: "Michael Chen",
            description: "Presented by the Critics Choice Association to honor the finest in cinematic achievement.",
            image: "https://images.unsplash.com/photo-1598394888170-951386e28d98"
        },
        {
            name: "Cannes Film Festival",
            category: "Palme d'Or",
            year: "2022",
            recipient: null,
            description: "The highest prize awarded at the Cannes Film Festival, one of the most prestigious in the world.",
            image: "https://images.unsplash.com/photo-1604076913837-52ab5629fba9"
        }
    ];
}

/**
 * Sets up the Telegram form in the awards modal
 */
function setupTelegramForm() {
    const telegramDisplay = document.getElementById('telegram-profile-display');
    const telegramForm = document.getElementById('telegram-profile-form');
    const telegramUsernameElement = document.getElementById('telegram-username');
    const telegramUsernameInput = document.getElementById('telegram-username-input');
    const editTelegramBtn = document.getElementById('edit-telegram-btn');
    const saveTelegramBtn = document.getElementById('save-telegram-btn');
    
    // Check if Telegram username exists in localStorage
    const storedUsername = localStorage.getItem('telegramUsername');
    
    if (storedUsername) {
        // Display the stored username
        telegramUsernameElement.textContent = `@${storedUsername}`;
        telegramDisplay.style.display = 'block';
        telegramForm.style.display = 'none';
        
        // Set up edit button
        editTelegramBtn.addEventListener('click', function() {
            telegramUsernameInput.value = storedUsername;
            telegramDisplay.style.display = 'none';
            telegramForm.style.display = 'block';
        });
    } else {
        // Show the form if no username is stored
        telegramDisplay.style.display = 'none';
        telegramForm.style.display = 'block';
    }
    
    // Set up save button
    saveTelegramBtn.addEventListener('click', function() {
        let username = telegramUsernameInput.value.trim();
        
        // Remove @ if included
        if (username.startsWith('@')) {
            username = username.substring(1);
        }
        
        if (username) {
            // Store in localStorage
            localStorage.setItem('telegramUsername', username);
            
            // Update display
            telegramUsernameElement.textContent = `@${username}`;
            telegramDisplay.style.display = 'block';
            telegramForm.style.display = 'none';
            
            // Show notification
            showNotification('Telegram profile updated!');
        } else {
            // Show error if empty
            telegramUsernameInput.style.borderColor = 'red';
            setTimeout(() => {
                telegramUsernameInput.style.borderColor = '';
            }, 3000);
        }
    });
}

/**
 * Helper function to show a notification
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after a few seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

/**
 * Fetches user metrics from the API or localStorage
 */
async function fetchUserMetrics() {
    try {
        console.log('Fetching user metrics...');
        
        // Try to use the API_URL variable if it exists
        const baseUrl = typeof API_URL !== 'undefined' ? API_URL : 'https://streamflix-backend.onrender.com/api';
        const endpoint = `${baseUrl}/metrics/user-points`;
        
        // Check if we're in Telegram Mini App
        let telegramUserId = '';
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id;
            console.log('Fetching metrics for Telegram user:', telegramUserId);
        }
        
        // Build fetch URL with Telegram user ID if available
        const fetchUrl = telegramUserId ? 
            `${endpoint}?telegramUserId=${telegramUserId}` : 
            endpoint;
        
        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch metrics: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received metrics data:', data);
        
        // Add current session tokens to the metrics
        if (typeof window.totalTokensEarned !== 'undefined' && window.totalTokensEarned > 0) {
            data.tokens = window.totalTokensEarned;
        }
        
        // Update UI with fetched metrics
        updateRewardsUI(data);
        return data;
    } catch (error) {
        console.warn('Error fetching metrics from API, using local storage or demo data:', error);
        
        // Try to use cached metrics from localStorage
        try {
            const cachedMetrics = localStorage.getItem('user_metrics');
            if (cachedMetrics) {
                const metrics = JSON.parse(cachedMetrics);
                console.log('Using cached metrics from localStorage:', metrics);
                
                // Add current session tokens to the cached metrics
                if (typeof window.totalTokensEarned !== 'undefined' && window.totalTokensEarned > 0) {
                    metrics.tokens = window.totalTokensEarned;
                }
                
                updateRewardsUI(metrics);
                return metrics;
            }
        } catch (storageError) {
            console.error('Error reading cached metrics:', storageError);
        }
        
        // Fallback to demo metrics if nothing else is available
        const demoMetrics = getDemoMetrics();
        
        // Add current session tokens to the demo metrics
        if (typeof window.totalTokensEarned !== 'undefined' && window.totalTokensEarned > 0) {
            demoMetrics.tokens = window.totalTokensEarned;
        }
        
        updateRewardsUI(demoMetrics);
        return demoMetrics;
    }
}

/**
 * Updates the rewards UI with the fetched metrics
 */
function updateRewardsUI(metrics) {
    // First, check if we have local earned tokens that should override API values
    // This ensures we show tokens earned in the current session
    if (typeof window.totalTokensEarned !== 'undefined' && window.totalTokensEarned > 0) {
        // For the rewards modal (session data), we only show session tokens
        // not total tokens from all time
        const sessionTokens = window.totalTokensEarned;
        console.log('Using session tokens for rewards UI update:', sessionTokens);
        
        // Update token balance for session
        document.getElementById('token-balance').textContent = Math.round(sessionTokens);
        
        // Update rank badge for session
        const rankName = document.getElementById('rank-name');
        const sessionRank = calculateSeedingRank(sessionTokens);
        rankName.textContent = sessionRank;
        rankName.className = ''; // Reset classes
        rankName.classList.add('rank-name', `${sessionRank.toLowerCase()}-rank`);
    } else {
        // No session data, use whatever we have from metrics (which could be 0)
        document.getElementById('token-balance').textContent = Math.round(metrics.tokens || 0);
        
        // Update rank badge
        const rankName = document.getElementById('rank-name');
        rankName.textContent = metrics.seedingRank || "Starter";
        rankName.className = ''; // Reset classes
        rankName.classList.add('rank-name', `${(metrics.seedingRank || "Starter").toLowerCase()}-rank`);
    }
    
    // Get current torrent stats for accurate display of current session
    let currentUploaded = 0;
    let currentPeers = 0;
    let currentSeedingTime = 0;
    
    if (window.currentTorrent) {
        // Get live stats from the current torrent (session stats only)
        currentUploaded = window.currentTorrent.uploaded || 0;
        currentPeers = window.currentTorrent.numPeers || 0;
        
        // Calculate current seeding time for this session
        if (window.seedingStartTime) {
            currentSeedingTime = (Date.now() - window.seedingStartTime) / 1000; // in seconds
        }
    }
    
    // Update stats display with session values only
    document.getElementById('total-uploaded').textContent = formatBytes(currentUploaded);
    
    // Format seeding time using the new formatter (session time only)
    document.getElementById('total-seeding-time').textContent = formatSeedingTime(currentSeedingTime);
    
    // Display session content count (1 if currently seeding)
    document.getElementById('content-seeded').textContent = window.currentTorrent ? 1 : 0;
    
    // Display session peers
    document.getElementById('peers-served').textContent = currentPeers;
    
    // Display telegram info if available
    if (metrics.telegramData && metrics.telegramData.telegramUsername) {
        // Store telegram data in localStorage for future use
        localStorage.setItem('telegramId', metrics.telegramData.telegramId || '');
        localStorage.setItem('telegramHandle', metrics.telegramData.telegramHandle || '');
        localStorage.setItem('telegramUsername', metrics.telegramData.telegramUsername || '');
        
        // Add telegram info to UI if there's a place for it
        const telegramElement = document.getElementById('telegram-username');
        if (telegramElement) {
            telegramElement.textContent = `@${metrics.telegramData.telegramUsername}`;
        }
    } else if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        // If we're in Telegram but didn't get user data from the API, use the WebApp data
        const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
        
        // Add telegram info to UI if there's a place for it
        const telegramElement = document.getElementById('telegram-username');
        if (telegramElement && telegramUser.username) {
            telegramElement.textContent = `@${telegramUser.username}`;
        }
    }
    
    // Update activity list with current session only
    if (window.currentTorrent) {
        // Create a simple activity entry for the current seeding session
        const currentActivity = [{
            title: window.currentTorrent.name || 'Current Video',
            startTime: new Date(window.seedingStartTime || Date.now()).toISOString(),
            endTime: new Date().toISOString(),
            bytesUploaded: currentUploaded,
            duration: currentSeedingTime,
            peers: currentPeers
        }];
        updateActivityList(currentActivity);
    } else if (metrics.recentHistory && metrics.recentHistory.length > 0) {
        // No current torrent but we have history
        updateActivityList(metrics.recentHistory);
    }
    
    // We don't save the session metrics to localStorage as that would overwrite total metrics
    console.log('Updated rewards UI with session data');
}

/**
 * Formats seeding time in seconds to a conventional time format
 * @param {number} seconds - Total seeding time in seconds
 * @returns {string} Formatted time string (e.g., "2d 5h" or "1h 20m" or "5m 30s")
 */
function formatSeedingTime(seconds) {
    if (!seconds || isNaN(seconds) || seconds < 0) {
        return '0m 0s';
    }
    
    // Calculate days, hours, minutes, seconds
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    // Format based on duration
    if (days > 0) {
        // If days exist, show only days and hours
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        // If no days but hours exist, show hours and minutes
        return `${hours}h ${minutes}m`;
    } else {
        // If less than an hour, show minutes and seconds
        return `${minutes}m ${secs}s`;
    }
}

/**
 * Updates the activity list in the awards modal
 */
function updateActivityList(activities) {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    // Clear existing activities except the first one (template)
    activityList.innerHTML = '';
    
    if (!activities || activities.length === 0) {
        // Show a message if no activities
        const emptyItem = document.createElement('div');
        emptyItem.className = 'activity-item';
        emptyItem.innerHTML = `
            <div class="activity-icon"><i class="fas fa-info-circle"></i></div>
            <div class="activity-info">
                <div class="activity-title">No activity yet</div>
                <div class="activity-meta">Start seeding content to earn awards!</div>
            </div>
        `;
        activityList.appendChild(emptyItem);
        return;
    }
    
    // Add each activity to the list
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Format the timestamp
        const timestamp = new Date(activity.endTime || activity.startTime);
        const timeAgo = formatTimeAgo(timestamp);
        
        // Calculate tokens earned (simple estimation)
        const gbUploaded = (activity.bytesUploaded || 0) / (1024 * 1024 * 1024);
        const hoursSeeded = (activity.duration || 0) / 3600;
        const tokensEarned = (gbUploaded * 10) + (hoursSeeded * 5) + (activity.peers || 0);
        
        activityItem.innerHTML = `
            <div class="activity-icon"><i class="fas fa-seedling"></i></div>
            <div class="activity-info">
                <div class="activity-title">Seeding ${activity.title || 'Unknown Content'}</div>
                <div class="activity-meta">${timeAgo}</div>
            </div>
            <div class="activity-tokens">+${tokensEarned.toFixed(2)} tokens</div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

/**
 * Formats a timestamp into a relative time string
 */
function formatTimeAgo(timestamp) {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000); // Difference in seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

/**
 * Fetches the leaderboard data
 */
async function fetchLeaderboard() {
    try {
        console.log('Fetching leaderboard...');
        const response = await fetch('http://localhost:5003/api/metrics/leaderboard');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received leaderboard data:', data);
        return data.leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return getDemoLeaderboard();
    }
}

/**
 * Displays the leaderboard modal
 */
function showLeaderboardModal(leaderboard) {
    // Create modal if it doesn't exist
    let leaderboardModal = document.getElementById('leaderboard-modal');
    
    if (!leaderboardModal) {
        leaderboardModal = document.createElement('div');
        leaderboardModal.id = 'leaderboard-modal';
        leaderboardModal.className = 'modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content rewards-modal-content';
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2><i class="fas fa-trophy"></i> Top Seeders</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="leaderboard-list" id="leaderboard-list">
                    <!-- Leaderboard items will be inserted here -->
                </div>
            </div>
        `;
        
        leaderboardModal.appendChild(modalContent);
        document.body.appendChild(leaderboardModal);
        
        // Set up close button
        leaderboardModal.querySelector('.close-modal').addEventListener('click', function() {
            leaderboardModal.style.display = 'none';
            document.body.style.overflow = ''; // Re-enable scrolling
        });
    }
    
    // Populate leaderboard
    const leaderboardList = leaderboardModal.querySelector('#leaderboard-list');
    leaderboardList.innerHTML = ''; // Clear existing items
    
    leaderboard.forEach((user, index) => {
        // Choose display name, prioritizing Telegram handle, then username
        const displayName = user.telegramUsername 
            ? `@${user.telegramUsername}` 
            : (user.telegramHandle || user.username);
            
        const listItem = document.createElement('div');
        listItem.className = 'leaderboard-item';
        
        listItem.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-user">
                <div class="user-name">${displayName}</div>
                <div class="user-rank ${user.rank.toLowerCase()}-rank">${user.rank}</div>
            </div>
            <div class="leaderboard-stat">
                <div>${formatBytes(user.totalUploaded)}</div>
                <small>uploaded</small>
            </div>
            <div class="leaderboard-tokens">${user.tokens.toFixed(2)}</div>
        `;
        
        leaderboardList.appendChild(listItem);
    });
    
    // Show modal
    leaderboardModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

/**
 * Shows reward information
 */
function showRewardInfo() {
    showNotification('Earn tokens by seeding content: 10 tokens per GB uploaded, 5 tokens per hour seeded, and 1 token per peer served. Tokens can be exchanged for premium content and features!');
}

/**
 * Returns demo metrics data
 */
function getDemoMetrics() {
    // Use the real token count if available
    const tokens = window.totalTokensEarned || 0;
    
    // Get actual torrent data if available
    let uploaded = 0;
    let peers = 0;
    let seedingTime = 0;
    let contentName = 'Big Buck Bunny';
    
    if (window.currentTorrent) {
        uploaded = window.currentTorrent.uploaded || 0;
        peers = window.currentTorrent.numPeers || 0;
        contentName = window.currentTorrent.name || contentName;
    }
    
    if (window.seedingStartTime) {
        seedingTime = (Date.now() - window.seedingStartTime) / 1000; // in seconds
    }
    
    // Current date for recent activity
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const fiveMinutesAgo = new Date(now.getTime() - 300000);
    
    return {
        tokens: tokens,
        seedingRank: tokens < 10 ? "Starter" : tokens < 50 ? "Bronze" : tokens < 100 ? "Silver" : "Gold",
        seedingStats: {
            totalBytesUploaded: uploaded || 1024 * 1024 * 5, // 5MB or actual uploaded
            totalSeedingTime: seedingTime || 120, // 2 minutes or actual time
            contentSeeded: 1,
            totalPeersServed: peers || 2
        },
        recentHistory: [
            {
                title: contentName,
                startTime: fiveMinutesAgo.toISOString(),
                endTime: oneMinuteAgo.toISOString(),
                bytesUploaded: uploaded || 1024 * 1024 * 2,
                duration: seedingTime || 240,
                peers: peers || 2
            }
        ],
        telegramData: window.Telegram?.WebApp?.initDataUnsafe?.user ? {
            telegramId: window.Telegram.WebApp.initDataUnsafe.user.id,
            telegramUsername: window.Telegram.WebApp.initDataUnsafe.user.username || 'telegram_user',
            telegramHandle: window.Telegram.WebApp.initDataUnsafe.user.username || 'telegram_user'
        } : null
    };
}

/**
 * Returns demo leaderboard data
 */
function getDemoLeaderboard() {
    return [
        {
            username: 'TorrentKing',
            telegramUsername: 'torrent_king',
            tokens: 1205.75,
            totalUploaded: 1024 * 1024 * 1024 * 250, // 250 GB
            totalSeedingTime: 3600 * 24 * 15, // 15 days
            rank: 'Diamond'
        },
        {
            username: 'SeedQueen',
            telegramUsername: 'seed_queen',
            tokens: 875.5,
            totalUploaded: 1024 * 1024 * 1024 * 125, // 125 GB
            totalSeedingTime: 3600 * 24 * 10, // 10 days
            rank: 'Platinum'
        },
        {
            username: 'DataSharer',
            telegramUsername: 'data_sharer',
            tokens: 542.25,
            totalUploaded: 1024 * 1024 * 1024 * 65, // 65 GB
            totalSeedingTime: 3600 * 24 * 7, // 7 days
            rank: 'Gold'
        },
        {
            username: 'MovieBuff',
            telegramUsername: 'movie_buff',
            tokens: 310.5,
            totalUploaded: 1024 * 1024 * 1024 * 30, // 30 GB
            totalSeedingTime: 3600 * 24 * 5, // 5 days
            rank: 'Silver'
        }
    ];
}

/**
 * Formats bytes into a human-readable string
 */
function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Export functions for use in other modules
window.AwardsModule = {
    populateAwardsCarousel,
    populateFilmAwardsModal,
    setupTelegramForm,
    fetchUserMetrics,
    updateRewardsUI,
    updateActivityList,
    fetchLeaderboard,
    showLeaderboardModal,
    showRewardInfo,
    formatSeedingTime
}; 