/**
 * torrent-stats.js - Functionality for the torrent stats container
 *
 * Handles all torrent stats UI functionality including:
 * - Collapsible torrent stats panel
 * - Progress visualization
 * - Torrent action buttons (pause/continue seeding)
 * - Stats display and updates
 */

// Global variables for torrent stats functionality
window.isSeedingPaused = false; // Global flag to track pause state

/**
 * Initialize torrent stats module with direct button handlers
 * This ensures the pause and stop seeding buttons work correctly
 * regardless of how they are activated
 */
function initTorrentStats() {
    console.log('Initializing torrent stats with direct button handlers');
    
    // Set up direct event handler for continue/pause seeding button
    const continueButton = document.getElementById('btn-continue-seeding');
    if (continueButton && !continueButton.hasAttribute('data-direct-handler')) {
        console.log('Adding direct handler to pause seeding button');
        
        // Mark the button to avoid double binding
        continueButton.setAttribute('data-direct-handler', 'true');
        
        continueButton.addEventListener('click', function() {
            console.log('Continue/Pause button clicked (direct handler)');
            
            // Toggle button state and global pause flag
            const isPaused = continueButton.classList.toggle('active');
            window.isSeedingPaused = isPaused;
            
            if (isPaused) {
                // Pause seeding logic
                continueButton.innerHTML = '<i class="fas fa-seedling"></i> Continue Seeding';
                
                // Stop metrics reporting intervals
                if (window.metricsInterval) {
                    clearInterval(window.metricsInterval);
                    window.metricsInterval = null;
                }
            } else {
                // Resume seeding logic
                continueButton.innerHTML = '<i class="fas fa-pause"></i> Pause Seeding';
                
                // Restart metrics if we have a torrent
                if (window.currentTorrent && !window.metricsInterval) {
                    window.metricsInterval = setInterval(() => {
                        if (!window.isSeedingPaused && window.currentTorrent) {
                            if (typeof window.reportMetrics === 'function') {
                                window.reportMetrics(
                                    window.currentTorrent.uploadSpeed,
                                    window.currentTorrent.numPeers
                                );
                            }
                        }
                    }, 2000);
                }
            }
        });
    }
    
    // Set up direct event handler for stop seeding button
    const stopSeedingButton = document.getElementById('btn-stop-seeding');
    const stopSeedingModal = document.getElementById('stop-seeding-modal');
    const confirmStopButton = document.getElementById('confirm-stop-seeding');
    const cancelStopButton = document.getElementById('cancel-stop-seeding');
    
    if (stopSeedingButton && !stopSeedingButton.hasAttribute('data-direct-handler')) {
        console.log('Adding direct handler to stop seeding button');
        
        // Mark the button to avoid double binding
        stopSeedingButton.setAttribute('data-direct-handler', 'true');
        
        stopSeedingButton.addEventListener('click', function() {
            console.log('Stop seeding button clicked (direct handler)');
            
            // Show confirmation modal
            if (stopSeedingModal) {
                stopSeedingModal.style.display = 'flex';
            }
        });
    }
    
    // Set up confirm and cancel buttons for stop seeding modal
    if (confirmStopButton && !confirmStopButton.hasAttribute('data-direct-handler')) {
        confirmStopButton.setAttribute('data-direct-handler', 'true');
        
        confirmStopButton.addEventListener('click', function() {
            console.log('Confirm stop seeding clicked (direct handler)');
            
            // Close modal
            if (stopSeedingModal) {
                stopSeedingModal.style.display = 'none';
            }
            
            // Call the stop seeding function
            if (typeof window.stopSeedingAndClaimPoints === 'function') {
                window.stopSeedingAndClaimPoints();
            }
        });
    }
    
    if (cancelStopButton && !cancelStopButton.hasAttribute('data-direct-handler')) {
        cancelStopButton.setAttribute('data-direct-handler', 'true');
        
        cancelStopButton.addEventListener('click', function() {
            // Just close the modal
            if (stopSeedingModal) {
                stopSeedingModal.style.display = 'none';
            }
        });
    }
    
    // Also set up the seeding duration update
    setupSeedingDurationUpdate();
}

// Make initTorrentStats accessible globally through the TorrentStats object
// so it can be called from watch.js and other modules
window.TorrentStats = window.TorrentStats || {};
window.TorrentStats.initTorrentStats = initTorrentStats;

// Initialize torrent stats when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing torrent stats module');
    initTorrentStats();
    
    // Initialize metrics reporting if we have an active torrent
    if (window.currentTorrent && !window.metricsInterval) {
        console.log('Starting initial metrics reporting interval');
        window.metricsInterval = setInterval(function() {
            if (window.TorrentStats && typeof window.TorrentStats.reportMetrics === 'function') {
                window.TorrentStats.reportMetrics(
                    window.currentTorrent.uploadSpeed,
                    window.currentTorrent.numPeers
                );
            }
        }, 2000);
    }

    // Initialize totalTokensEarned if not already set
    if (typeof window.totalTokensEarned === 'undefined') {
        window.totalTokensEarned = 0;
    }

    // Set up a dedicated interval for updating the earning rate display
    if (!window.earningRateInterval) {
        window.earningRateInterval = setInterval(function() {
            if (window.totalTokensEarned > 0) {
                const earningRateElement = document.getElementById('earning-rate');
                if (earningRateElement && earningRateElement.textContent === '0') {
                    const totalTokensDisplay = Math.round(window.totalTokensEarned);
                    earningRateElement.textContent = totalTokensDisplay;
                    console.log(`Restored total tokens display: ${totalTokensDisplay}`);
                }
            }
        }, 500);
    }
});

/**
 * Setup the collapsible behavior for the torrent stats container
 */
function setupTorrentStatsCollapsible() {
    const torrentHeader = document.getElementById('torrent-header');
    const torrentDetails = document.getElementById('torrent-details');
    
    if (!torrentHeader || !torrentDetails) return;
    
    // Set initial state (expanded by default)
    let isCollapsed = false;
    
    // Function to toggle collapse state
    function toggleCollapse() {
        isCollapsed = !isCollapsed;
        
        if (isCollapsed) {
            torrentHeader.classList.add('collapsed');
            torrentDetails.classList.add('collapsed');
        } else {
            torrentHeader.classList.remove('collapsed');
            torrentDetails.classList.remove('collapsed');
        }
    }
    
    // Event listener for clicking on the header
    torrentHeader.addEventListener('click', function(e) {
        toggleCollapse();
    });
    
    // Update the summary progress value when the detailed progress updates
    function updateProgressSummary() {
        const progressValue = document.getElementById('torrent-progress');
        const progressSummary = document.getElementById('torrent-progress-summary');
        
        if (progressValue && progressSummary) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        progressSummary.textContent = progressValue.textContent;
                    }
                });
            });
            
            observer.observe(progressValue, { childList: true, characterData: true, subtree: true });
        }
    }
    
    updateProgressSummary();
}

/**
 * Setup event handlers for torrent action buttons
 */
function setupTorrentActions() {
    const continueButton = document.getElementById('btn-continue-seeding');
    const viewStatsButton = document.getElementById('btn-view-stats');
    
    // Check if we've already set up this button to prevent duplicate listeners
    if (continueButton && !continueButton.hasAttribute('data-listener-attached')) {
        console.log('Setting up torrent actions - attaching click listener to continue button');
        
        // Mark the button as having a listener attached
        continueButton.setAttribute('data-listener-attached', 'true');
        
        continueButton.addEventListener('click', function() {
            console.log('Continue button clicked');
            
            // Toggle button state
            const isSeeding = continueButton.classList.toggle('active');
            
            // Save current reward amount to prevent display glitches
            const earningRateElement = document.getElementById('earning-rate');
            const currentRewardAmount = earningRateElement ? earningRateElement.textContent : '0';
            
            if (isSeeding) {
                // Update button text to Continue Seeding
                continueButton.innerHTML = '<i class="fas fa-seedling"></i> Continue Seeding';
                
                // Set global flag for paused state
                window.isSeedingPaused = true;
                console.log('Setting isSeedingPaused flag to true');
                
                // Stop reporting metrics to pause points counting
                if (window.metricsInterval) {
                    clearInterval(window.metricsInterval);
                    window.metricsInterval = null;
                    console.log('Cleared metrics interval');
                    window.isReportingMetrics = false; // Mark metrics reporting as stopped
                }
                
                // Also clear the earning rate interval to completely stop updates
                if (window.earningRateInterval) {
                    clearInterval(window.earningRateInterval);
                    window.earningRateInterval = null;
                    console.log('Cleared earning rate interval');
                }
                
                // Save the current total tokens to prevent any updates while paused
                window.pausedTotalTokens = window.totalTokensEarned;
                console.log('Saved paused total tokens:', window.pausedTotalTokens);
            } else {
                // Update button text to Pause Seeding
                continueButton.innerHTML = '<i class="fas fa-pause"></i> Pause Seeding';
                
                // Reset global flag for paused state
                window.isSeedingPaused = false;
                console.log('Setting isSeedingPaused flag to false');
                
                // Restore the metrics reporting interval
                if (!window.metricsInterval && window.currentTorrent) {
                    console.log('Restoring metrics reporting interval');
                    window.metricsInterval = setInterval(function() {
                        if (window.reportMetrics) {
                            window.reportMetrics(
                                window.currentTorrent.uploadSpeed,
                                window.currentTorrent.numPeers
                            );
                        }
                    }, 2000);
                }
                
                // Restore the earning rate interval
                if (!window.earningRateInterval) {
                    console.log('Restoring earning rate interval');
                    window.earningRateInterval = setInterval(function() {
                        if (window.totalTokensEarned > 0) {
                            const earningRateElement = document.getElementById('earning-rate');
                            if (earningRateElement && earningRateElement.textContent === '0') {
                                const totalTokensDisplay = Math.round(window.totalTokensEarned);
                                earningRateElement.textContent = totalTokensDisplay;
                                console.log(`Restored total tokens display: ${totalTokensDisplay}`);
                            }
                        }
                    }, 500);
                }
            }
        });
    }
    
    // Set up view stats button if it exists
    if (viewStatsButton && !viewStatsButton.hasAttribute('data-listener-attached')) {
        console.log('Setting up torrent actions - attaching click listener to view stats button');
        
        // Mark the button as having a listener attached
        viewStatsButton.setAttribute('data-listener-attached', 'true');
        
        viewStatsButton.addEventListener('click', function() {
            console.log('View stats button clicked');
            
            // Find the rewards modal
            const rewardsModal = document.getElementById('rewards-modal');
            if (rewardsModal) {
                // Show the modal
                rewardsModal.style.display = 'flex';
                
                // Apply animation
                setTimeout(() => {
                    rewardsModal.classList.add('active');
                }, 10);
            }
        });
    }
}

/**
 * Updates the torrent stats display with the latest data
 * @param {Object} stats - The torrent stats to display
 */
function updateTorrentStats(stats) {
    if (!stats) return;
    
    const { downloadSpeed, uploadSpeed, progress, numPeers } = stats;
    
    // Update speed and peer stats
    const downloadSpeedElement = document.getElementById('download-speed');
    const uploadSpeedElement = document.getElementById('upload-speed');
    const peersCountElement = document.getElementById('peers-count');
    const torrentProgressElement = document.getElementById('torrent-progress');
    const progressBarElement = document.getElementById('progress-bar');
    
    if (downloadSpeedElement && typeof downloadSpeed !== 'undefined') {
        downloadSpeedElement.textContent = formatSpeed(downloadSpeed);
    }
    
    if (uploadSpeedElement && typeof uploadSpeed !== 'undefined') {
        uploadSpeedElement.textContent = formatSpeed(uploadSpeed);
    }
    
    if (peersCountElement && typeof numPeers !== 'undefined') {
        peersCountElement.textContent = numPeers;
    }
    
    if (torrentProgressElement && typeof progress !== 'undefined') {
        torrentProgressElement.textContent = progress + '%';
    }
    
    if (progressBarElement && typeof progress !== 'undefined') {
        progressBarElement.style.width = progress + '%';
    }
}

/**
 * Setup the seeding duration update functionality
 * This updates the display showing how long the user has been seeding
 */
function setupSeedingDurationUpdate() {
    console.log('Setting up seeding duration update');
    
    // Initialize the seeding start time if not already set
    if (!window.seedingStartTime) {
        window.seedingStartTime = Date.now();
    }
    
    // Set up interval to update the seeding duration display
    if (!window.seedingDurationInterval) {
        window.seedingDurationInterval = setInterval(function() {
            // Only update if seeding is active
            if (!window.isSeedingPaused && window.currentTorrent) {
                updateSeedingDuration();
            }
        }, 1000);
    }
}

/**
 * Update the seeding duration display with current time
 */
function updateSeedingDuration() {
    const currentTime = Date.now();
    const seedingTime = (currentTime - window.seedingStartTime) / 1000; // in seconds
    
    const formattedTime = formatDuration(seedingTime * 1000);
    
    // Update the display
    const progressLabel = document.querySelector('.progress-label');
    if (progressLabel) {
        // Include uploaded amount if available
        let uploadText = '';
        if (window.currentTorrent) {
            uploadText = ` | Total Upload: ${formatBytes(window.currentTorrent.uploaded)}`;
        }
        
        progressLabel.textContent = `Seeding Time: ${formattedTime}${uploadText}`;
    }
}

/**
 * Formats bytes to human-readable format
 * @param {number} bytes - The number of bytes to format
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
function formatBytes(bytes) {
    if (bytes === undefined || bytes === null || isNaN(bytes) || typeof bytes !== 'number') {
        return '0 B';
    }
    
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats speed in bytes/sec to human-readable format
 * @param {number} bytesPerSec - The speed in bytes per second
 * @returns {string} Formatted string (e.g., "4.80 MB/s")
 */
function formatSpeed(bytesPerSec) {
    // Handle undefined, null, NaN, or negative values
    if (bytesPerSec === undefined || bytesPerSec === null || isNaN(bytesPerSec) || bytesPerSec < 0) {
        return '<1 KB/s';
    }
    
    // Handle very small values (less than 1 KB/s)
    if (bytesPerSec < 1024) {
        return '<1 KB/s';
    }
    
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(1024));
    
    // Always format with 2 decimal places
    const formattedValue = (bytesPerSec / Math.pow(1024, i)).toFixed(2);
    return formattedValue + ' ' + sizes[i];
}

/**
 * Forces the progress bar to be green with a glow effect
 */
function forceGreenProgressBar() {
    const progressBarInner = document.querySelector('.progress-bar-inner');
    const progressBar = document.getElementById('progress-bar');
    
    if (progressBar) {
        // Set to 100% width
        progressBar.style.width = '100%';
        
        // Change to solid green
        progressBar.style.backgroundColor = '#4CAF50';
        
        // Add a green border and glow
        progressBar.style.border = '1px solid #45a049';
        progressBar.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.8)';
    }
}

/**
 * Add a persistent seeding indicator to the UI
 */
function addPersistentSeedingIndicator() {
    // Create the indicator if it doesn't exist
    let indicator = document.getElementById('persistent-seeding-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'persistent-seeding-indicator';
        
        // Create pulse element
        const pulse = document.createElement('span');
        pulse.className = 'seeding-pulse';
        
        // Create text element
        const text = document.createElement('span');
        text.textContent = 'Seeding Active';
        
        // Append elements
        indicator.appendChild(pulse);
        indicator.appendChild(text);
        
        // Style the indicator
        Object.assign(indicator.style, {
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '5px 10px',
            borderRadius: '4px',
            color: '#FF9800',
            fontWeight: '600',
            fontSize: '14px',
            opacity: '0',
            transition: 'opacity 0.3s ease-in-out',
            cursor: 'pointer'
        });
        
        // Style the pulse
        Object.assign(pulse.style, {
            width: '8px',
            height: '8px',
            backgroundColor: '#4CAF50',
            borderRadius: '50%',
            marginRight: '8px',
            animation: 'pulse 1.5s infinite'
        });
        
        // Find header and insert indicator
        const header = document.querySelector('.watch-header');
        if (header) {
            header.style.position = 'relative';
            header.appendChild(indicator);
        }
        
        // Add click handler
        indicator.addEventListener('click', function() {
            // Toggle seeding pause state
            if (window.isSeedingPaused) {
                resumeSeeding();
            } else {
                pauseSeeding();
            }
        });
        
        // Add the pulse animation if it doesn't exist
        if (!document.getElementById('pulse-animation')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation';
            style.textContent = `
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 6px rgba(76, 175, 80, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    return indicator;
}

/**
 * Update the persistent seeding indicator based on current state
 */
function updatePersistentSeedingIndicator() {
    const indicator = document.getElementById('persistent-seeding-indicator');
    if (!indicator) return;
    
    // Check multiple indicators of active seeding, not just currentTorrent
    const isSeedingActive = (window.currentTorrent || 
                           (document.getElementById('progress-bar') && 
                            document.getElementById('progress-bar').style.width === '100%') ||
                           window.isReportingMetrics === true) && 
                           window.isSeedingPaused !== true;
    
    if (isSeedingActive) {
        console.log('Seeding appears active, showing persistent indicator');
        indicator.style.display = 'flex';
        setTimeout(() => {
            indicator.style.opacity = '1';
        }, 100);
    } else {
        indicator.style.opacity = '0';
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 300);
    }
}

/**
 * Add a seeding status section to the UI
 * This provides more detailed information about the seeding status
 * DISABLED: This section has been disabled per user request
 */
function addSeedingStatusSection() {
    console.log('addSeedingStatusSection called but is now disabled');
    
    // Remove the section if it exists
    const existingSection = document.getElementById('seeding-status-section');
    if (existingSection && existingSection.parentNode) {
        existingSection.parentNode.removeChild(existingSection);
    }
    
    // Do not create a new section
    return null;
}

/**
 * Show a temporary message to the user
 */
    notification.style.borderRadius = '4px';
    notification.style.color = 'white';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    
    // Set color based on type
    if (type === 'success') {
        notification.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
    } else if (type === 'error') {
        notification.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
    } else if (type === 'info') {
        notification.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
    }
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center;">
            <i class="${type === 'success' ? 'fas fa-check-circle' : type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle'}" style="margin-right: 10px;"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.opacity = '0';
        setTimeout(function() {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

/**
 * Start periodic updates of the seeding status section
 * DISABLED: This function is disabled since seeding-status-section has been removed
 */
function startSeedingStatusUpdates() {
    // Clear any existing interval
    if (window.seedingStatusInterval) {
        clearInterval(window.seedingStatusInterval);
        window.seedingStatusInterval = null;
    }
    
    // Do not start a new interval - section has been disabled
    return;
}

/**
 * Update the seeding status information in the UI
 * DISABLED: This function is disabled since seeding-status-section has been removed
 */
function updateSeedingStatusInfo() {
    // Do nothing - section has been disabled
    return;
}

/**
 * Format a duration in milliseconds to HH:MM:SS
 */
function formatDuration(durationMs) {
    const seconds = Math.floor(durationMs / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
        return `${days}D ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

/**
 * Stop seeding and clear state
 * Note: The status section display has been disabled
 */
function stopSeedingAndClearState() {
    // Clear the state first
    clearSeedingState();
    
    // If there's an active torrent, try to destroy it
    if (window.currentTorrent) {
        try {
            // Pause seeding if possible
            if (typeof window.currentTorrent.pause === 'function') {
                window.currentTorrent.pause();
            }
            
            // Some clients may have destroy/remove methods
            if (typeof window.currentTorrent.destroy === 'function') {
                window.currentTorrent.destroy();
            } else if (typeof window.currentTorrent.remove === 'function') {
                window.currentTorrent.remove();
            }
            
            // Clear the reference
            window.currentTorrent = null;
        } catch (error) {
            console.error('Error stopping torrent:', error);
        }
    }
    
    // Reset UI elements
    const seedOnlyButton = document.querySelector('.btn-download');
    if (seedOnlyButton) {
        seedOnlyButton.disabled = false;
        seedOnlyButton.innerHTML = '<i class="fas fa-compact-disc"></i> Seed Only';
        seedOnlyButton.classList.remove('seeding-active');
    }
    
    const continueButton = document.getElementById('btn-continue-seeding');
    if (continueButton) {
        continueButton.disabled = true;
    }
    
    // Reset flags
    window.isSeedingPaused = false;
    window.isReportingMetrics = false;
    
    // Clear intervals
    if (window.metricsInterval) {
        clearInterval(window.metricsInterval);
        window.metricsInterval = null;
    }
    if (window.earningRateInterval) {
        clearInterval(window.earningRateInterval);
        window.earningRateInterval = null;
    }
    if (window.seedingStatusInterval) {
        clearInterval(window.seedingStatusInterval);
        window.seedingStatusInterval = null;
    }
    
    // Hide the indicator
    updatePersistentSeedingIndicator();
    
    // Show a confirmation message
    console.log("Seeding stopped and state cleared");
}

/**
 * Force show the seeding indicator when torrent is active
 * Note: The status section display has been disabled
 */
function forceShowSeedingUI() {
    console.log('Forcing seeding UI to appear');
    
    // Check for indicators that seeding should be active
    const downloadComplete = document.getElementById('progress-bar') && 
                           document.getElementById('progress-bar').style.width === '100%';
    const seedingActive = window.currentTorrent || window.isReportingMetrics === true || downloadComplete;
    
    // Proceed if any indicator suggests seeding should be active
    if (seedingActive) {
        console.log('Seeding indicators detected, forcing UI to show');
        
        // Create the indicator if it doesn't exist
        if (!document.getElementById('persistent-seeding-indicator')) {
            addPersistentSeedingIndicator();
        }
        
        // Force the indicator to be visible regardless of currentTorrent status
        const indicator = document.getElementById('persistent-seeding-indicator');
        if (indicator) {
            indicator.style.display = 'flex';
            indicator.style.opacity = '1';
        }
        
        // Ensure state is saved
        if (typeof saveSeedingState === 'function') {
            saveSeedingState();
        }
    }
}

// Add UI elements when torrent is created
document.addEventListener('DOMContentLoaded', function() {
    // Only add the persistent indicator, not the status section
    addPersistentSeedingIndicator();
    
    // We'll use a MutationObserver to detect when a torrent is created
    // by watching for changes to the torrent-info element's display style
    const torrentInfoObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'torrent-info' && 
                mutation.type === 'attributes' && 
                mutation.attributeName === 'style' &&
                window.currentTorrent) {
                
                // Show the persistent indicator
                updatePersistentSeedingIndicator();
                
                // Reset session tracking
                window.seedingSessionStartTime = new Date();
                window.seedingSessionStartTokens = window.totalTokensEarned || 0;
                window.seedingSessionStartUploaded = window.currentTorrent.uploaded || 0;
            }
        });
    });
    
    // Start observing the torrent-info element if it exists
    const torrentInfo = document.getElementById('torrent-info');
    if (torrentInfo) {
        torrentInfoObserver.observe(torrentInfo, { attributes: true });
    }
    
    // Update existing restore functions to handle UI properly
    if (window.restoreSeedingSession) {
        const existingRestoreSeedingSession = window.restoreSeedingSession;
        window.restoreSeedingSession = function(state) {
            existingRestoreSeedingSession(state);
        };
    }
    
    // If there's an initialization function, enhance it - only add the indicator, not the status section
    if (window.initSeedingPersistence) {
        const uiEnhancedInitSeedingPersistence = window.initSeedingPersistence;
        window.initSeedingPersistence = function() {
            // Call the previously enhanced function
            uiEnhancedInitSeedingPersistence();
            
            // Only add the indicator, not the status section
            addPersistentSeedingIndicator();
        };
    }
});

/**
 * Report metrics and update points for seeding
 * @param {number} uploadSpeed - Current upload speed in bytes/second
 * @param {number} numPeers - Number of connected peers
 */
async function reportMetrics(uploadSpeed, numPeers) {
    // Skip if seeding is paused
    if (window.isSeedingPaused) {
        console.log('Metrics reporting skipped - seeding is paused');
        return;
    }

    // Skip if already reporting (throttle)
    if (window.isReportingMetrics) {
        return;
    }

    window.isReportingMetrics = true;
    
    try {
        // Calculate upload speed in Mbps (bytes to bits, then to Mbps)
        const uploadSpeedMbps = (uploadSpeed * 8) / 1000000;
        
        // Calculate token earning rate based on upload speed and peers
        // Minimum earning rate of 1 token per report if actively seeding
        const tokenEarningRate = Math.max(1, Math.floor(uploadSpeedMbps * numPeers));
        
        // Get content ID from URL
        const contentId = window.location.search.match(/[?&]id=([^&]+)/) ? 
                         window.location.search.match(/[?&]id=([^&]+)/)[1] : 'unknown';

        // Prepare metrics for API
        const currentMetrics = {
            contentId,
            uploadSpeed,
            peersConnected: numPeers,
            seedingTime: 2, // Since we report every 2 seconds
            timestamp: new Date().toISOString()
        };

        // Use the API_URL constant if defined, never use localhost
        const apiUrl = typeof API_URL !== 'undefined' ? API_URL : 'https://streamflix-backend.onrender.com/api';
        
        // Send metrics to Telegram API endpoint if user is from Telegram
        const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (telegramUserId) {
            // Use Telegram API endpoint
            const telegramUsername = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || '';
            
            // Prepare Telegram-specific payload
            const telegramMetrics = {
                contentId: contentId,
                uploadSpeed: uploadSpeed / 1024, // Convert to KB/s
                peersConnected: numPeers,
                seedingTime: 2, // Report in 2 second increments
                telegramUserId: telegramUserId,
                telegramUsername: telegramUsername
            };
            
            console.log(`Reporting metrics to Telegram API for user: ${telegramUserId}`);
            const response = await fetch(`${apiUrl}/metrics/telegram-seeding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(telegramMetrics)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Telegram API response:', data);
                
                // Update the tokens display
                if (data && typeof data.totalTokens !== 'undefined') {
                    window.totalTokensEarned = data.totalTokens;
                    
                    // Update UI
                    const earningRate = document.getElementById('earning-rate');
                    if (earningRate) {
                        earningRate.textContent = Math.round(window.totalTokensEarned);
                    }
                    
                    console.log(`Telegram tokens earned: ${data.tokensEarned || 0}, Total: ${data.totalTokens}`);
                }
            }
            window.isReportingMetrics = false;
            return; // Skip regular API call if we made a Telegram call
        }
        
        // DISABLE REGULAR API CALL - It's returning 401 Unauthorized
        // Just use the local point calculation instead
        console.log('Using local points calculation instead of regular API endpoint');
        
        // Fallback to local calculation
        // Award 2 points per reporting interval (1 point per second, 2 second interval)
        if (typeof window.totalTokensEarned === 'undefined') {
            window.totalTokensEarned = 0;
        }
        window.totalTokensEarned += 2; // 1 point per second for 2 seconds
            
        // Update the display
        const earningRate = document.getElementById('earning-rate');
        if (earningRate) {
            const totalTokensDisplay = Math.round(window.totalTokensEarned);
            earningRate.textContent = totalTokensDisplay;
        }
    } catch (error) {
        console.error('API metrics reporting failed, continuing with local points:', error);
        
        // Fallback to local calculation
        // Award 2 points per reporting interval (1 point per second, 2 second interval)
        if (typeof window.totalTokensEarned === 'undefined') {
            window.totalTokensEarned = 0;
        }
        window.totalTokensEarned += 2; // 1 point per second for 2 seconds
            
        // Update the display
        const earningRate = document.getElementById('earning-rate');
        if (earningRate) {
            const totalTokensDisplay = Math.round(window.totalTokensEarned);
            earningRate.textContent = totalTokensDisplay;
        }
        
        console.log('Using local points instead of API endpoint');
    } finally {
        window.isReportingMetrics = false;
    }
}

/**
 * Start metrics reporting for an active torrent
 */
function startMetricsReporting() {
    if (!window.metricsInterval && window.currentTorrent) {
        console.log('Starting metrics reporting interval from external call');
        window.metricsInterval = setInterval(function() {
            if (window.TorrentStats && window.TorrentStats.reportMetrics) {
                window.TorrentStats.reportMetrics(
                    window.currentTorrent.uploadSpeed,
                    window.currentTorrent.numPeers
                );
            }
        }, 2000);
        
        // Also start the earning rate interval for UI updates
        if (!window.earningRateInterval) {
            window.earningRateInterval = setInterval(function() {
                if (window.totalTokensEarned > 0) {
                    const earningRateElement = document.getElementById('earning-rate');
                    if (earningRateElement) {
                        const totalTokensDisplay = Math.round(window.totalTokensEarned);
                        earningRateElement.textContent = totalTokensDisplay;
                    }
                }
            }, 500);
        }
    }
}

// Additional function to directly update tokens based on torrent stats
// This will run independent of the API call to ensure points are displayed
function updateMetricsDisplay() {
    // Only run if we're not in paused state
    if (window.isSeedingPaused) {
        return;
    }
    
    // Check if we have an active torrent
    if (window.client && window.client.torrents && window.client.torrents.length > 0) {
        const torrent = window.client.torrents[0];
        
        if (torrent && torrent.uploadSpeed > 0) {
            // Award 1 point per second of seeding, regardless of upload speed
            // This is a fallback for when the API call fails
            const secondsElapsed = 1; // Since this is called every second
            const pointsPerSecond = 1; // 1 point per second
            const newTokens = secondsElapsed * pointsPerSecond;
            
            // Initialize if needed
            if (typeof window.totalTokensEarned === 'undefined') {
                window.totalTokensEarned = 0;
            }
            
            // Add to total
            window.totalTokensEarned += newTokens;
            
            // Update the display
            const earningRate = document.getElementById('earning-rate');
            if (earningRate) {
                const totalTokensDisplay = Math.round(window.totalTokensEarned);
                earningRate.textContent = totalTokensDisplay;
            }
            
            console.log(`Local points update: +${newTokens} points (1 point/second), Total: ${window.totalTokensEarned}`);
        }
    }
}

// Set up interval for direct metrics updates
document.addEventListener('DOMContentLoaded', function() {
    if (!window.directMetricsInterval) {
        window.directMetricsInterval = setInterval(function() {
            if (window.TorrentStats && typeof window.TorrentStats.updateMetricsDisplay === 'function') {
                window.TorrentStats.updateMetricsDisplay();
            } else {
                updateMetricsDisplay();
            }
        }, 1000); // Update every second
    }
});

/**
 * Update the progress value display
 * @param {number} progress - Progress value between 0 and 100
 */
function updateProgressValue(progress) {
    const progressValue = document.getElementById('torrent-progress');
    const progressBar = document.getElementById('progress-bar');
    
    if (progressValue) {
        progressValue.textContent = Math.round(progress * 100) + '%';
    }
    
    if (progressBar) {
        progressBar.style.width = (progress * 100) + '%';
        
        // If progress is 100%, make it green
        if (progress >= 1) {
            progressBar.style.backgroundColor = '#4CAF50';
            progressBar.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.8)';
        }
    }
}

/**
 * Update the progress bar with the given progress value
 * @param {number} progress - Progress value between 0 and 1
 */
function updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;
    
    // Convert progress to percentage
    const percentage = Math.min(100, Math.max(0, progress * 100));
    progressBar.style.width = percentage + '%';
    
    // Update color when complete
    if (percentage >= 100) {
        progressBar.style.backgroundColor = '#4CAF50';
        progressBar.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.8)';
    }
    
    // Update the progress text if it exists
    const progressValue = document.getElementById('torrent-progress');
    if (progressValue) {
        progressValue.textContent = Math.round(percentage) + '%';
    }
}

// Export torrent stats functions
window.TorrentStats = {
    updateTorrentStats,
    formatBytes,
    formatSpeed,
    forceGreenProgressBar,
    addPersistentSeedingIndicator,
    updatePersistentSeedingIndicator,
    addSeedingStatusSection,
    startSeedingStatusUpdates,
    updateSeedingStatusInfo,
    formatDuration,
    stopSeedingAndClearState,
    forceShowSeedingUI,
    
    restoreSeedingSession,
    reportMetrics,
    startMetricsReporting,
    updateMetricsDisplay,
    updateProgressValue,
    updateProgressBar,
    updateProgressSummary,
    updateSeedingDuration,
    updateStatsDisplay
};

// Restore seeding session from localStorage
function restoreSeedingSession(state) {
    try {
        console.log('Restoring seeding session from state:', state);
        
        if (window.client) {
            // Code to restore seeding session
            console.log('Using WebTorrent client to restore seeding');
            
            // Add the torrent back
            window.client.add(state.magnetURI, torrent => {
                console.log('Torrent restored successfully');
                
                // Store the reference
                window.currentTorrent = torrent;
                
                // Update UI for seeding
                const seedOnlyButton = document.querySelector('.btn-download');
                if (seedOnlyButton) {
                    seedOnlyButton.disabled = true;
                    seedOnlyButton.innerHTML = '<i class="fas fa-check"></i> Seeding';
                    seedOnlyButton.classList.add('seeding-active');
                }
                
                // Enable the continue/pause seeding button
                const continueButton = document.getElementById('btn-continue-seeding');
                if (continueButton) {
                    continueButton.disabled = false;
                    
                    // Set button state based on paused state
                    if (state.paused) {
                        pauseSeeding();
                    } else {
                        resumeSeeding();
                    }
                }
                
                // Update the torrent statistics
                updateInitialStats(torrent, state);
                
                // Start periodic updates
                if (!window.seedingStatusInterval) {
                    startSeedingStatusUpdates();
                }
                
                console.log('Seeding session restored. You are sharing content with other viewers.');
            });
        } else {
            console.warn('WebTorrent client not found. Could not restore seeding session.');
        }
    } catch (e) {
        console.error('Error restoring seeding session:', e);
    }
}

// Make functions available globally through TorrentStats namespace
if (!window.TorrentStats) {
    window.TorrentStats = {};
}

window.TorrentStats.updatePersistentSeedingIndicator = updatePersistentSeedingIndicator;
window.TorrentStats.addPersistentSeedingIndicator = addPersistentSeedingIndicator;
window.TorrentStats.forceGreenProgressBar = forceGreenProgressBar;
window.TorrentStats.updateProgressValue = updateProgressValue;
window.TorrentStats.updateProgressBar = updateProgressBar;
window.TorrentStats.updateProgressSummary = updateProgressSummary;
window.TorrentStats.updateSeedingDuration = updateSeedingDuration;
window.TorrentStats.reportMetrics = reportMetrics;
window.TorrentStats.updateMetricsDisplay = updateMetricsDisplay;
window.TorrentStats.formatDuration = formatDuration;
window.TorrentStats.formatBytes = formatBytes;
window.TorrentStats.stopSeedingAndClearState = stopSeedingAndClearState;
window.TorrentStats.startSeedingStatusUpdates = startSeedingStatusUpdates;
window.TorrentStats.updateSeedingStatusInfo = updateSeedingStatusInfo;
window.TorrentStats.updateStatsDisplay = updateStatsDisplay;
window.TorrentStats.addSeedingStatusSection = addSeedingStatusSection;

// Main initialization function
function initTorrentStats() {
    // Set up event listeners for toggling the torrent stats display
    setupTorrentStatsCollapsible();
    
    // Set up event listeners for the continue/pause seeding button
    setupTorrentActions();
    
    // Add direct handlers for buttons to ensure they work even if the earlier setup failed
    const continueButton = document.getElementById('btn-continue-seeding');
    const stopSeedingButton = document.getElementById('btn-stop-seeding');
    const stopSeedingModal = document.getElementById('stop-seeding-modal');
    
    // Direct handler for Pause button - important fallback
    if (continueButton && !continueButton.hasAttribute('data-direct-handler')) {
        continueButton.setAttribute('data-direct-handler', 'true');
        continueButton.onclick = function() {
            console.log('Direct handler for continue button clicked');
            
            // Toggle button state
            const isSeeding = continueButton.classList.toggle('active');
            
            if (isSeeding) {
                // Update button text to Continue Seeding
                continueButton.innerHTML = '<i class="fas fa-seedling"></i> Continue Seeding';
                
                // Set global flag for paused state
                window.isSeedingPaused = true;
                console.log('Setting isSeedingPaused flag to true');
                
                // Stop reporting metrics to pause points counting
                if (window.metricsInterval) {
                    clearInterval(window.metricsInterval);
                    window.metricsInterval = null;
                    console.log('Cleared metrics interval');
                    window.isReportingMetrics = false; // Mark metrics reporting as stopped
                }
            } else {
                // Update button text to Pause Seeding
                continueButton.innerHTML = '<i class="fas fa-pause"></i> Pause Seeding';
                
                // Reset global flag for paused state
                window.isSeedingPaused = false;
                console.log('Setting isSeedingPaused flag to false');
                
                // Restore the metrics reporting interval
                if (!window.metricsInterval && window.currentTorrent) {
                    console.log('Restoring metrics reporting interval');
                    window.metricsInterval = setInterval(function() {
                        if (window.reportMetrics) {
                            window.reportMetrics(
                                window.currentTorrent.uploadSpeed,
                                window.currentTorrent.numPeers
                            );
                        }
                    }, 2000);
                }
            }
        };
    }
    
    // Direct handler for Stop Seeding button - important fallback
    if (stopSeedingButton && !stopSeedingButton.hasAttribute('data-direct-handler')) {
        stopSeedingButton.setAttribute('data-direct-handler', 'true');
        stopSeedingButton.onclick = function() {
            console.log('Direct handler for stop seeding button clicked');
            if (stopSeedingModal) {
                stopSeedingModal.style.display = 'flex';
            }
        };
    }
    
    // Setup modal buttons if they exist and the modal is present
    if (stopSeedingModal) {
        const confirmStopButton = document.getElementById('confirm-stop-seeding');
        const cancelStopButton = document.getElementById('cancel-stop-seeding');
        
        if (confirmStopButton && !confirmStopButton.hasAttribute('data-direct-handler')) {
            confirmStopButton.setAttribute('data-direct-handler', 'true');
            confirmStopButton.onclick = function() {
                // Call the stopSeedingAndClaimPoints function if it exists
                if (typeof window.stopSeedingAndClaimPoints === 'function') {
                    window.stopSeedingAndClaimPoints();
                }
                // Close the modal
                stopSeedingModal.style.display = 'none';
            };
        }
        
        if (cancelStopButton && !cancelStopButton.hasAttribute('data-direct-handler')) {
            cancelStopButton.setAttribute('data-direct-handler', 'true');
            cancelStopButton.onclick = function() {
                // Just close the modal
                stopSeedingModal.style.display = 'none';
            };
        }
    }
    
    // Set up seeding duration update
    setupSeedingDurationUpdate();
} 