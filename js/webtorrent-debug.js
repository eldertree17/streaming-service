/**
 * WebTorrent Debug Script
 * 
 * This script helps diagnose issues with WebTorrent.
 * Include it in the page after the WebTorrent script.
 */

(function() {
  console.log('WebTorrent Debug Script loaded');
  
  // Check if WebTorrent is defined
  if (typeof WebTorrent === 'undefined') {
    console.error('WebTorrent is not defined. Library may not be loaded correctly.');
    
    // Add a visible error message on the page
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '10px';
    errorDiv.style.left = '10px';
    errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.zIndex = '10000';
    errorDiv.innerHTML = 'WebTorrent library not loaded. Check console for details.';
    document.body.appendChild(errorDiv);
    
    return;
  }
  
  console.log('WebTorrent version:', WebTorrent.VERSION);
  
  // Try to create a test client
  try {
    const testClient = new WebTorrent();
    console.debug('WebTorrent test client created');
    
    // Listen for client errors
    testClient.on('error', function(err) {
      console.error('WebTorrent client error:', err);
    });
    
    // Clean up after testing
    setTimeout(() => {
      testClient.destroy(function() {
        console.debug('WebTorrent test client cleanup complete');
      });
    }, 5000);
    
  } catch (err) {
    console.error('Error creating WebTorrent client:', err);
  }
  
  // Monitor network requests for WebTorrent trackers
  if (window.performance && window.performance.getEntries) {
    console.log('Monitoring network requests for WebTorrent trackers...');
    setTimeout(() => {
      const resources = window.performance.getEntries();
      const trackerRequests = resources.filter(r => 
        r.name.includes('tracker') || 
        r.name.includes('webtorrent') ||
        r.name.includes('wss://')
      );
      
      console.log('Detected tracker requests:', trackerRequests);
    }, 3000);
  }
  
  // Add global helper function to check WebTorrent status
  window.debugWebTorrent = function() {
    console.log('WebTorrent defined:', typeof WebTorrent !== 'undefined');
    console.log('Current client:', window.client);
    
    if (window.client) {
      console.log('Torrents:', window.client.torrents);
      
      if (window.client.torrents.length > 0) {
        const torrent = window.client.torrents[0];
        console.log('First torrent:', {
          infoHash: torrent.infoHash,
          downloaded: torrent.downloaded,
          uploaded: torrent.uploaded,
          progress: torrent.progress,
          downloadSpeed: torrent.downloadSpeed,
          uploadSpeed: torrent.uploadSpeed,
          numPeers: torrent.numPeers,
          ready: torrent.ready,
          path: torrent.path
        });
      }
    }
  };
  
  // Patch window.WebTorrent to track all instances
  const originalWebTorrent = window.WebTorrent;
  window.webTorrentInstances = [];
  
  window.WebTorrent = function() {
    const instance = new originalWebTorrent(...arguments);
    window.webTorrentInstances.push(instance);
    console.log('New WebTorrent instance created. Total instances:', window.webTorrentInstances.length);
    return instance;
  };
  
  // Copy over all original properties
  for (const prop in originalWebTorrent) {
    if (originalWebTorrent.hasOwnProperty(prop)) {
      window.WebTorrent[prop] = originalWebTorrent[prop];
    }
  }
  
  console.log('WebTorrent debug patching complete');
})(); 