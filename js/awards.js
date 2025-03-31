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
 * Fetches user metrics from the API
 */
async function fetchUserMetrics() {
    try {
        console.log('Fetching user metrics...');
        const response = await fetch('http://localhost:5003/api/metrics/user', {
            headers: {
                'x-demo-user': 'demo123' // For development/demo purposes
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch metrics: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received metrics:', data);
        return data;
    } catch (error) {
        console.error('Error fetching user metrics:', error);
        return getDemoMetrics();
    }
}

/**
 * Updates the rewards UI with the fetched metrics
 */
function updateRewardsUI(metrics) {
    // Update token balance
    document.getElementById('token-balance').textContent = metrics.tokens.toFixed(2);
    
    // Update rank badge
    const rankName = document.getElementById('rank-name');
    rankName.textContent = metrics.seedingRank;
    rankName.className = ''; // Reset classes
    rankName.classList.add('rank-name', `${metrics.seedingRank.toLowerCase()}-rank`);
    
    // Update stats
    document.getElementById('total-uploaded').textContent = formatBytes(metrics.seedingStats.totalBytesUploaded);
    
    const seedingHours = metrics.seedingStats.totalSeedingTime / 3600;
    document.getElementById('total-seeding-time').textContent = 
        seedingHours < 1 
            ? `${Math.round(seedingHours * 60)} mins` 
            : `${seedingHours.toFixed(1)} hrs`;
    
    document.getElementById('content-seeded').textContent = metrics.seedingStats.contentSeeded;
    document.getElementById('peers-served').textContent = metrics.seedingStats.totalPeersServed;
    
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
    }
    
    // Update activity list
    if (metrics.recentHistory && metrics.recentHistory.length > 0) {
        updateActivityList(metrics.recentHistory);
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
    return {
        tokens: parseFloat(localStorage.getItem('demoTokens') || '0'),
        seedingRank: localStorage.getItem('demoRank') || 'Starter',
        seedingStats: {
            totalBytesUploaded: parseInt(localStorage.getItem('demoUploaded') || '0'),
            totalSeedingTime: parseInt(localStorage.getItem('demoSeedingTime') || '0'),
            contentSeeded: parseInt(localStorage.getItem('demoContentSeeded') || '0'),
            totalPeersServed: parseInt(localStorage.getItem('demoPeersServed') || '0')
        },
        recentHistory: []
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
    showRewardInfo
}; 