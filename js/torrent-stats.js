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

// Initialize torrent stats when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing torrent stats module');
    setupTorrentStatsCollapsible();
    setupTorrentActions();
    
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
 * Updates the seeding duration display
 */
function updateSeedingDuration() {
    if (!window.seedingStartTime) return;
    
    const progressLabel = document.querySelector('.progress-label');
    if (!progressLabel) return;
    
    const now = Date.now();
    const seedingDuration = now - window.seedingStartTime;
    
    // Calculate minutes and seconds
    const minutes = Math.floor(seedingDuration / (1000 * 60));
    const seconds = Math.floor((seedingDuration % (1000 * 60)) / 1000);
    
    // Get upload amount from current torrent
    let uploadedFormatted = '0 B';
    if (window.currentTorrent) {
        uploadedFormatted = formatBytes(window.currentTorrent.uploaded);
    }
    
    // Create formatted time string
    const formatted = `${minutes}m ${seconds}s`;
    
    // Update the label with formatted time and upload amount
    progressLabel.textContent = `Seeding time: ${formatted} | Total Upload: ${uploadedFormatted}`;
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
            if (window.TorrentStats && typeof window.TorrentStats.showTemporaryMessage === 'function') {
                window.TorrentStats.showTemporaryMessage('Seeding is active. You are sharing this content with other viewers.', 'info');
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
function showTemporaryMessage(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 15px';
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
    showTemporaryMessage('Seeding stopped and state cleared');
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

        // Send metrics to backend - updating port to 5003
        const response = await fetch('http://localhost:5003/api/metrics/seeding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-demo-user': 'demo123' // For development/demo purposes
            },
            body: JSON.stringify(currentMetrics)
        });

        if (response.ok) {
            const data = await response.json();
            
            // Update the cumulative total of tokens earned
            if (data.tokensEarned > 0) {
                // Add the newly earned tokens to the total
                if (typeof window.totalTokensEarned === 'undefined') {
                    window.totalTokensEarned = 0;
                }
                window.totalTokensEarned += data.tokensEarned;
                
                // Update the reward badge to show the total tokens earned
                const rewardBadge = document.querySelector('.reward-badge');
                const rewardAmount = rewardBadge?.querySelector('.reward-amount');
                if (rewardAmount) {
                    // Round to nearest integer and display total tokens
                    const totalTokensDisplay = Math.round(window.totalTokensEarned);
                    rewardAmount.textContent = totalTokensDisplay;
                }
                
                console.log(`Metrics Update - Upload Speed: ${uploadSpeedMbps.toFixed(2)} Mbps, Peers: ${numPeers}, Tokens Earned: ${data.tokensEarned}, Total: ${window.totalTokensEarned}`);
            }
        }
    } catch (error) {
        console.error('Error reporting metrics:', error);
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
            // Convert bytes to megabits
            const uploadSpeedMbps = (torrent.uploadSpeed * 8) / 1000000;
            
            // Generate some points based on upload speed
            const newTokens = uploadSpeedMbps * 0.1; // 0.1 tokens per Mbps
            
            // Initialize if needed
            if (typeof window.totalTokensEarned === 'undefined') {
                window.totalTokensEarned = 0;
            }
            
            // Add to total with a small fraction to avoid overwhelming the display
            window.totalTokensEarned += newTokens;
            
            // Update the display
            const earningRateElement = document.getElementById('earning-rate');
            if (earningRateElement) {
                const totalTokensDisplay = Math.round(window.totalTokensEarned);
                earningRateElement.textContent = totalTokensDisplay;
            }
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
    showTemporaryMessage,
    restoreSeedingSession,
    reportMetrics,
    startMetricsReporting,
    updateMetricsDisplay,
    updateProgressValue,
    updateProgressBar
};

// Restore seeding session from localStorage
function restoreSeedingSession(state) {
    console.log('Restoring seeding session:', state);
    
    if (!state) return;
    
    try {
        // Parse the state if it's a string
        const sessionState = typeof state === 'string' ? JSON.parse(state) : state;
        
        // Only restore if we have a valid state
        if (sessionState && sessionState.magnetUri) {
            console.log('Valid session state found. Attempting to restore.');
            
            // If we have a client, use it to restore
            if (window.WebTorrent && window.webTorrentClient) {
                console.log('WebTorrent client found. Adding torrent.');
                
                // Add the torrent and set up the seeding UI
                window.webTorrentClient.add(sessionState.magnetUri, function(torrent) {
                    console.log('Torrent added for seeding restoration.');
                    window.currentTorrent = torrent;
                    
                    // Update the persistent indicator
                    updatePersistentSeedingIndicator();
                    
                    // Show notification that seeding has been restored
                    showTemporaryMessage('Seeding session restored. You are sharing content with other viewers.');
                    
                    // Restore session tracking data
                    window.seedingSessionStartTime = new Date(sessionState.startTime || new Date());
                    window.seedingSessionStartTokens = sessionState.startTokens || 0;
                    window.seedingSessionStartUploaded = sessionState.startUploaded || 0;
                    
                    // Force show the seeding UI (only the indicator, not the section)
                    forceShowSeedingUI();
                });
            } else {
                console.warn('WebTorrent client not found. Could not restore seeding session.');
            }
        }
    } catch (e) {
        console.error('Error restoring seeding session:', e);
    }
}

// Show a temporary notification message
function showTemporaryMessage(message, duration = 5000) {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('torrent-notification');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'torrent-notification';
        messageElement.style.position = 'fixed';
        messageElement.style.bottom = '20px';
        messageElement.style.right = '20px';
        messageElement.style.padding = '10px 20px';
        messageElement.style.backgroundColor = '#333';
        messageElement.style.color = '#fff';
        messageElement.style.borderRadius = '4px';
        messageElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        messageElement.style.zIndex = '1000';
        messageElement.style.transition = 'opacity 0.3s ease';
        messageElement.style.opacity = '0';
        document.body.appendChild(messageElement);
    }
    
    // Set message and show
    messageElement.textContent = message;
    messageElement.style.opacity = '1';
    
    // Hide after duration
    setTimeout(() => {
        messageElement.style.opacity = '0';
        // Remove from DOM after fade out
        setTimeout(() => {
            if (messageElement && messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }, duration);
}

// Make it available globally through TorrentStats namespace
if (!window.TorrentStats) {
    window.TorrentStats = {};
}
window.TorrentStats.showTemporaryMessage = showTemporaryMessage;
window.TorrentStats.updatePersistentSeedingIndicator = updatePersistentSeedingIndicator; 