/**
 * WebTorrent Fix Script
 * 
 * This script addresses issues with WebTorrent initialization and working around
 * CORS and CSP restrictions.
 */
(function() {
  console.log('WebTorrent Fix Script loaded');
  
  // Global constants
  window.REWARD_UPDATE_THROTTLE = 2000; // 2 seconds
  window.totalTokensEarned = 0;
  window.isSeedingPaused = false;
  window.isReportingMetrics = false;
  
  // Fetch user points from server
  function fetchUserPoints() {
    try {
      // Get Telegram user ID if available
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '';
      const telegramUsername = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || '';
      
      if (!telegramUserId) {
        console.log('No Telegram user ID available, skipping points fetch');
        return;
      }
      
      // Use the API_URL constant if defined
      const apiUrl = typeof API_URL !== 'undefined' ? API_URL : 'https://streamflix-backend.onrender.com/api';
      
      // Fetch user points from server
      console.log(`Fetching points for Telegram user ID: ${telegramUserId}`);
      fetch(`${apiUrl}/metrics/user-points?telegramUserId=${telegramUserId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.points !== undefined) {
            window.totalTokensEarned = data.points;
            
            // Update UI
            const earningRate = document.getElementById('earning-rate');
            if (earningRate) {
              earningRate.textContent = Math.round(window.totalTokensEarned);
            }
            
            console.log('Fetched user points:', window.totalTokensEarned);
          }
        })
        .catch(err => {
          console.error('Error fetching user points:', err);
        });
    } catch (error) {
      console.error('Error in fetchUserPoints:', error);
    }
  }
  
  // Make sure WebTorrent is properly loaded
  function ensureWebTorrentLoaded() {
    return new Promise((resolve, reject) => {
      if (typeof WebTorrent !== 'undefined') {
        console.log('WebTorrent already loaded, version:', WebTorrent.VERSION);
        resolve(WebTorrent);
        return;
      }
      
      console.log('WebTorrent not loaded, attempting to load it now');
      
      // Load WebTorrent dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/webtorrent/1.9.7/webtorrent.min.js';
      script.onload = function() {
        console.log('WebTorrent loaded dynamically, version:', WebTorrent.VERSION);
        resolve(WebTorrent);
      };
      script.onerror = function(err) {
        console.error('Failed to load WebTorrent:', err);
        reject(new Error('Failed to load WebTorrent'));
      };
      document.head.appendChild(script);
    });
  }
  
  // Create a WebTorrent client safely
  window.createWebTorrentClient = function() {
    return ensureWebTorrentLoaded()
      .then(() => {
        try {
          // Create client with specific trackers to avoid CORS issues
          const client = new WebTorrent({
            tracker: {
              rtcConfig: {
                iceServers: [
                  { urls: 'stun:stun.l.google.com:19302' },
                  { urls: 'stun:global.stun.twilio.com:3478' }
                ]
              }
            }
          });
          
          console.log('WebTorrent client created successfully:', client);
          
          // Set up error handling
          client.on('error', function(err) {
            console.error('WebTorrent client error:', err);
          });
          
          // Set up warning handling (non-fatal issues)
          client.on('warning', function(err) {
            console.warn('WebTorrent warning:', err);
          });
          
          // Make client globally available
          window.client = client;
          
          return client;
        } catch (err) {
          console.error('Error creating WebTorrent client:', err);
          throw err;
        }
      });
  };
  
  // Add a torrent safely
  window.addTorrentSafely = function(magnetUri, opts) {
    return new Promise((resolve, reject) => {
      if (!window.client) {
        window.createWebTorrentClient()
          .then(client => addTorrent(client, magnetUri, opts, resolve, reject))
          .catch(reject);
      } else {
        addTorrent(window.client, magnetUri, opts, resolve, reject);
      }
    });
  };
  
  function addTorrent(client, magnetUri, opts, resolve, reject) {
    try {
      console.log('Adding torrent:', magnetUri);
      
      const torrent = client.add(magnetUri, opts || {}, torrent => {
        console.log('Torrent added successfully:', torrent);
        window.currentTorrent = torrent;
        resolve(torrent);
      });
      
      // Set up torrent-specific error handling
      torrent.on('error', err => {
        console.error('Torrent error:', err);
        reject(err);
      });
      
      // Set up download progress handling
      torrent.on('download', bytes => {
        const progress = Math.round(torrent.progress * 100);
        
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        const progressValue = document.getElementById('torrent-progress');
        
        if (progressBar) {
          progressBar.style.width = progress + '%';
        }
        
        if (progressValue) {
          progressValue.textContent = progress + '%';
        }
        
        // Update loading indicator
        const loadingProgress = document.getElementById('loading-progress');
        if (loadingProgress) {
          loadingProgress.textContent = progress + '%';
        }
      });
      
      // Display torrent stats
      torrent.on('wire', () => {
        updateStats(torrent);
      });
      
      // Handle download completion
      torrent.on('done', () => {
        console.log('Torrent download complete');
        
        // Update UI
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
          progressBar.style.width = '100%';
          progressBar.classList.add('completed');
          progressBar.style.backgroundColor = '#4CAF50';
        }
        
        // Enable the continue seeding button
        const continueButton = document.getElementById('btn-continue-seeding');
        if (continueButton) {
          continueButton.disabled = false;
        }
        
        // Show notification
        showSeedingNotification();
      });
      
      // Set up interval to update stats
      const statsInterval = setInterval(() => {
        if (window.currentTorrent) {
          updateStats(window.currentTorrent);
        } else {
          clearInterval(statsInterval);
        }
      }, 1000);
      
    } catch (err) {
      console.error('Error adding torrent:', err);
      reject(err);
    }
  }
  
  // Update torrent statistics display
  function updateStats(torrent) {
    const downloadSpeed = document.getElementById('download-speed');
    const uploadSpeed = document.getElementById('upload-speed');
    const peersCount = document.getElementById('peers-count');
    
    if (downloadSpeed) {
      downloadSpeed.textContent = formatSpeed(torrent.downloadSpeed);
    }
    
    if (uploadSpeed) {
      uploadSpeed.textContent = formatSpeed(torrent.uploadSpeed);
    }
    
    if (peersCount) {
      peersCount.textContent = torrent.numPeers;
    }
    
    // Send metrics to the server for rewards
    if (!window.isSeedingPaused && torrent.uploadSpeed > 0) {
      // Use TorrentStats.reportMetrics if available, otherwise use our own implementation
      if (window.TorrentStats && typeof window.TorrentStats.reportMetrics === 'function') {
        window.TorrentStats.reportMetrics(torrent.uploadSpeed, torrent.numPeers);
      } else {
        reportMetrics(torrent.uploadSpeed, torrent.numPeers);
      }
    }
  }
  
  // Format speed in bytes/s to human-readable form
  function formatSpeed(bytes) {
    if (bytes === 0) return '0 KB/s';
    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
  }
  
  // Show notification that seeding has begun
  function showSeedingNotification() {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 15px';
    notification.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
    notification.style.color = 'white';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '10000';
    
    notification.innerHTML = '<div style="display: flex; align-items: center;"><i class="fas fa-check-circle" style="margin-right: 10px;"></i>Download complete! Now seeding to others.</div>';
    
    document.body.appendChild(notification);
    
    // Remove after a few seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease-in-out';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Also show persistent seeding indicator
    const persistentIndicator = document.getElementById('persistent-seeding-indicator');
    if (persistentIndicator) {
      persistentIndicator.style.display = 'flex';
      persistentIndicator.style.opacity = '1';
    }
  }
  
  // Report metrics to the server for rewards
  function reportMetrics(uploadSpeed, numPeers) {
    // Skip if already throttled
    if (window.lastRewardUpdateTime && Date.now() - window.lastRewardUpdateTime < window.REWARD_UPDATE_THROTTLE) {
      return;
    }
    
    // Record this update time
    window.lastRewardUpdateTime = Date.now();
    window.isReportingMetrics = true;
    
    try {
      // Get content ID
      const urlParams = new URLSearchParams(window.location.search);
      const contentId = urlParams.get('id') || 'sample-video-1';
      
      // Get Telegram user ID if available
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '';
      const telegramUsername = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || '';
      
      // Log Telegram detection info for debugging
      console.log(`Telegram detection: window.Telegram=${!!window.Telegram}, WebApp=${!!window.Telegram?.WebApp}, initDataUnsafe=${!!window.Telegram?.WebApp?.initDataUnsafe}, user=${!!window.Telegram?.WebApp?.initDataUnsafe?.user}`);
      
      // If we're in a Telegram Mini App but couldn't get the user ID, try using window.IS_TELEGRAM_MINI_APP flag
      const isTelegramApp = telegramUserId || window.IS_TELEGRAM_MINI_APP || (window.StreamFlixConfig && window.StreamFlixConfig.IS_TELEGRAM_MINI_APP);
      
      // Create a variable we can modify if needed
      let effectiveTelegramUserId = telegramUserId;
      
      if (!effectiveTelegramUserId && isTelegramApp) {
        console.warn('In Telegram environment but could not get telegramUserId, using fallback ID');
        // Use a fallback ID based on local storage or generate a random one that persists
        const fallbackId = localStorage.getItem('telegram_fallback_id') || 'tg_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('telegram_fallback_id', fallbackId);
        effectiveTelegramUserId = fallbackId;
      }
      
      if (!effectiveTelegramUserId) {
        // If not a Telegram user, use local points calculation instead of API
        console.log('No Telegram user ID available, using local points calculation');
        
        // Fallback to local calculation for non-Telegram users
        // Award points at 1 point per 2 second interval
        const secondsElapsed = 2; // This interval runs every 2 seconds
        const pointsPerSecond = 1; // 1 point per second
        const newPoints = secondsElapsed * pointsPerSecond;
        
        // Add to total tokens
        window.totalTokensEarned = (window.totalTokensEarned || 0) + newPoints;
        
        // Update UI
        const earningRate = document.getElementById('earning-rate');
        if (earningRate) {
          // Round to nearest integer for display
          earningRate.textContent = Math.round(window.totalTokensEarned);
        }
        
        console.log(`Local points calculation: +${newPoints}, Total: ${window.totalTokensEarned}`);
        window.isReportingMetrics = false;
        return;
      }
      
      // Prepare payload
      const metricsData = {
        contentId: contentId,
        uploadSpeed: uploadSpeed / 1024, // Convert to KB/s
        peersConnected: numPeers,
        seedingTime: 2, // Report in 2 second increments
        telegramUserId: effectiveTelegramUserId,
        telegramUsername: telegramUsername
      };
      
      // Use the API_URL constant if defined
      const apiUrl = typeof API_URL !== 'undefined' ? API_URL : 'https://streamflix-backend.onrender.com/api';
      const endpoint = `${apiUrl}/metrics/telegram-seeding`;
      
      // Send metrics to server
      console.log(`Reporting metrics to ${endpoint} for Telegram user: ${effectiveTelegramUserId}, upload speed: ${metricsData.uploadSpeed.toFixed(2)} KB/s, peers: ${numPeers}`);
      
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metricsData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Server response:', data);
        
        // Update tokens earned
        if (data && typeof data.totalTokens !== 'undefined') {
          console.log(`Token data received: totalTokens=${data.totalTokens}, tokensEarned=${data.tokensEarned || 0}`);
          
          // Initialize totalTokensEarned if needed
          if (typeof window.totalTokensEarned === 'undefined') {
            window.totalTokensEarned = 0;
          }
          
          window.totalTokensEarned = data.totalTokens;
          
          // Update UI
          const earningRate = document.getElementById('earning-rate');
          if (earningRate) {
            earningRate.textContent = Math.round(window.totalTokensEarned);
            console.log(`Updated earning rate display to ${Math.round(window.totalTokensEarned)}`);
          } else {
            console.log('Could not find earning-rate element to update');
          }
          
          console.log(`Tokens earned this update: ${data.tokensEarned || 0}, Total: ${data.totalTokens}`);
        } else {
          console.warn('Response missing totalTokens property:', data);
        }
        
        window.isReportingMetrics = false;
      })
      .catch(err => {
        console.error('Error reporting metrics:', err);
        window.isReportingMetrics = false;
        
        // Fallback to local points calculation if API fails
        const secondsElapsed = 2; // 2 seconds per update
        const pointsPerSecond = 1; // 1 point per second
        const newPoints = secondsElapsed * pointsPerSecond;
        
        // Add to total tokens
        window.totalTokensEarned = (window.totalTokensEarned || 0) + newPoints;
        
        // Update UI
        const earningRate = document.getElementById('earning-rate');
        if (earningRate) {
          // Round to nearest integer for display
          earningRate.textContent = Math.round(window.totalTokensEarned);
          console.log(`API failed but updated local points: +${newPoints}, Total: ${window.totalTokensEarned}`);
        }
      });
    } catch (error) {
      console.error('Error in reportMetrics:', error);
      window.isReportingMetrics = false;
      
      // Fallback to local points calculation if there's an error
      const secondsElapsed = 2; // 2 seconds per update
      const pointsPerSecond = 1; // 1 point per second
      const newPoints = secondsElapsed * pointsPerSecond;
      
      // Add to total tokens
      window.totalTokensEarned = (window.totalTokensEarned || 0) + newPoints;
      
      // Update UI
      const earningRate = document.getElementById('earning-rate');
      if (earningRate) {
        // Round to nearest integer for display
        earningRate.textContent = Math.round(window.totalTokensEarned);
        console.log(`Error in reportMetrics but updated local points: +${newPoints}, Total: ${window.totalTokensEarned}`);
      }
    }
  }
  
  // Make reportMetrics available globally
  window.reportMetrics = reportMetrics;
  
  // Update rewards modal with user points
  function updateRewardsModal() {
    // First check if we have cached metrics in localStorage
    try {
      const cachedMetrics = localStorage.getItem('user_metrics');
      
      if (cachedMetrics) {
        const metrics = JSON.parse(cachedMetrics);
        console.log('Using cached metrics for rewards modal:', metrics);
        
        // Update token balance
        const tokenBalance = document.getElementById('token-balance');
        if (tokenBalance) {
          // Override with current session tokens if available
          if (typeof window.totalTokensEarned !== 'undefined' && window.totalTokensEarned > 0) {
            tokenBalance.textContent = Math.round(window.totalTokensEarned);
          } else {
            tokenBalance.textContent = Math.round(metrics.tokens);
          }
        }
        
        // Update rank based on current tokens
        const currentTokens = window.totalTokensEarned || metrics.tokens;
        const rankName = document.getElementById('rank-name');
        if (rankName) {
          const rank = calculateRank(currentTokens);
          rankName.textContent = rank;
          rankName.className = ''; // Reset classes
          rankName.classList.add('rank-name', `${rank.toLowerCase()}-rank`);
        }
        
        // Update stats with current torrent data
        if (window.currentTorrent) {
          const totalUploaded = document.getElementById('total-uploaded');
          if (totalUploaded) {
            // Add current torrent's uploaded bytes to total
            const uploadedBytes = metrics.seedingStats.totalBytesUploaded + (window.currentTorrent.uploaded || 0);
            totalUploaded.textContent = formatBytes(uploadedBytes);
          }
          
          const totalPeers = document.getElementById('peers-served');
          if (totalPeers) {
            // Add current peers to total
            const peersServed = metrics.seedingStats.totalPeersServed + (window.currentTorrent.numPeers || 0);
            totalPeers.textContent = peersServed;
          }
          
          // Calculate and update seeding time
          const totalSeedingTime = document.getElementById('total-seeding-time');
          if (totalSeedingTime && window.seedingStartTime) {
            const currentSeedingTime = (Date.now() - window.seedingStartTime) / 1000; // in seconds
            const totalTime = metrics.seedingStats.totalSeedingTime + currentSeedingTime;
            
            // Use the formatSeedingTime function from awards.js
            if (window.AwardsModule && typeof window.AwardsModule.formatSeedingTime === 'function') {
              totalSeedingTime.textContent = window.AwardsModule.formatSeedingTime(totalTime);
            } else {
              // Use our local formatSeedingTime function
              totalSeedingTime.textContent = formatSeedingTime(totalTime);
            }
          }
          
          // Update content seeded count
          const contentSeeded = document.getElementById('content-seeded');
          if (contentSeeded) {
            // Ensure we count at least the current item
            contentSeeded.textContent = Math.max(1, metrics.seedingStats.contentSeeded);
          }
        }
      } else if (window.totalTokensEarned) {
        // If no cached metrics but we have current session tokens, at least update those
        const tokenBalance = document.getElementById('token-balance');
        if (tokenBalance) {
          tokenBalance.textContent = Math.round(window.totalTokensEarned);
        }
        
        // Set rank based on current tokens
        const rankName = document.getElementById('rank-name');
        if (rankName) {
          const rank = calculateRank(window.totalTokensEarned);
          rankName.textContent = rank;
          rankName.className = ''; // Reset classes
          rankName.classList.add('rank-name', `${rank.toLowerCase()}-rank`);
        }
        
        // Update current torrent stats if available
        if (window.currentTorrent) {
          const totalUploaded = document.getElementById('total-uploaded');
          if (totalUploaded) {
            totalUploaded.textContent = formatBytes(window.currentTorrent.uploaded || 0);
          }
          
          const totalPeers = document.getElementById('peers-served');
          if (totalPeers) {
            totalPeers.textContent = window.currentTorrent.numPeers || 0;
          }
          
          const contentSeeded = document.getElementById('content-seeded');
          if (contentSeeded) {
            contentSeeded.textContent = '1'; // At least the current content
          }
          
          // Calculate and update seeding time
          const totalSeedingTime = document.getElementById('total-seeding-time');
          if (totalSeedingTime && window.seedingStartTime) {
            const currentSeedingTime = (Date.now() - window.seedingStartTime) / 1000; // in seconds
            
            // Use the formatSeedingTime function from awards.js
            if (window.AwardsModule && typeof window.AwardsModule.formatSeedingTime === 'function') {
              totalSeedingTime.textContent = window.AwardsModule.formatSeedingTime(currentSeedingTime);
            } else {
              // Use our local formatSeedingTime function
              totalSeedingTime.textContent = formatSeedingTime(currentSeedingTime);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating rewards modal:', error);
      
      // Fallback to just showing current session tokens
      if (window.totalTokensEarned) {
        const tokenBalance = document.getElementById('token-balance');
        if (tokenBalance) {
          tokenBalance.textContent = Math.round(window.totalTokensEarned);
        }
      }
    }
  }
  
  /**
   * Calculate rank based on tokens earned
   */
  function calculateRank(tokens) {
    if (tokens < 10) return "Starter";
    if (tokens < 50) return "Bronze";
    if (tokens < 100) return "Silver";
    if (tokens < 250) return "Gold";
    if (tokens < 500) return "Platinum";
    return "Diamond";
  }
  
  /**
   * Formats seeding time in seconds to a conventional time format
   * Duplicate of the function in awards.js to ensure consistent formatting
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
   * Format bytes to human-readable string
   */
  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  // Initialize WebTorrent
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ensureWebTorrentLoaded();
      fetchUserPoints(); // Fetch user points when DOM is loaded
      
      // Set up rewards modal button click
      const btnViewStats = document.getElementById('btn-view-stats');
      if (btnViewStats) {
        btnViewStats.addEventListener('click', function() {
          // Fetch latest points before showing modal
          fetchUserPoints();
          
          // Show the rewards modal
          const rewardsModal = document.getElementById('rewards-modal');
          if (rewardsModal) {
            updateRewardsModal();
            rewardsModal.style.display = 'flex';
          }
        });
      }
      
      // Set up regular monitoring of torrent stats
      setupTorrentMonitoring();
    });
  } else {
    ensureWebTorrentLoaded();
    fetchUserPoints(); // Fetch user points immediately
    setupTorrentMonitoring();
  }
  
  // Monitor torrent upload stats and report metrics regularly
  function setupTorrentMonitoring() {
    // If torrent-stats.js is already monitoring, we don't need our own monitoring
    if (window.TorrentStats && typeof window.TorrentStats.reportMetrics === 'function') {
      console.log('TorrentStats.reportMetrics is available, skipping duplicate monitoring');
      return;
    }
    
    console.log('Setting up our own torrent monitoring');
    setInterval(function() {
      if (window.client && window.client.torrents && window.client.torrents.length > 0) {
        const torrent = window.client.torrents[0];
        if (torrent && torrent.uploadSpeed > 0 && !window.isReportingMetrics) {
          console.log(`Detected upload activity: ${(torrent.uploadSpeed / 1024).toFixed(2)} KB/s, peers: ${torrent.numPeers}`);
          reportMetrics(torrent.uploadSpeed, torrent.numPeers);
        }
      }
    }, window.REWARD_UPDATE_THROTTLE);
  }
  
})(); 