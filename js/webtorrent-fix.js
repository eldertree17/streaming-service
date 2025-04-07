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
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'browser-test-user';
      
      // Use the API_URL constant if defined
      const apiUrl = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:5003/api';
      
      // Fetch user points from server
      fetch(`${apiUrl}/user/points?userId=${telegramUserId}`)
        .then(response => response.json())
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
      reportMetrics(torrent.uploadSpeed, torrent.numPeers);
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
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'browser-test-user';
      
      // Prepare payload
      const metricsData = {
        contentId: contentId,
        uploadSpeed: uploadSpeed / 1024, // Convert to KB/s
        peersConnected: numPeers,
        seedingTime: 2, // Report in 2 second increments
        timestamp: new Date().toISOString(),
        userId: telegramUserId // Include Telegram user ID
      };
      
      // Use the API_URL constant if defined
      const apiUrl = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:5003/api';
      
      // Send metrics to server
      fetch(`${apiUrl}/metrics/seeding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metricsData)
      })
      .then(response => response.json())
      .then(data => {
        // Update tokens earned
        if (data.tokensEarned) {
          // Initialize totalTokensEarned if needed
          if (typeof window.totalTokensEarned === 'undefined') {
            window.totalTokensEarned = 0;
          }
          
          window.totalTokensEarned += data.tokensEarned;
          
          // Update UI
          const earningRate = document.getElementById('earning-rate');
          if (earningRate) {
            earningRate.textContent = Math.round(window.totalTokensEarned);
          }
        }
        
        window.isReportingMetrics = false;
      })
      .catch(err => {
        console.error('Error reporting metrics:', err);
        window.isReportingMetrics = false;
      });
    } catch (error) {
      console.error('Error in reportMetrics:', error);
      window.isReportingMetrics = false;
    }
  }
  
  // Update rewards modal with user points
  function updateRewardsModal() {
    if (window.totalTokensEarned) {
      const tokenBalance = document.getElementById('token-balance');
      if (tokenBalance) {
        tokenBalance.textContent = Math.round(window.totalTokensEarned);
      }
    }
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
    });
  } else {
    ensureWebTorrentLoaded();
    fetchUserPoints(); // Fetch user points immediately
  }
  
})(); 