// torrent-service.js
const WebTorrent = require('webtorrent');

// Create client
const client = new WebTorrent();

// Track active torrents for status updates
const activeTorrents = {};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  // If stopping the page, destroy the client to stop seeding
  window.addEventListener('beforeunload', () => {
    client.destroy();
  });
});

/**
 * Stream a torrent to a video element
 * @param {string} magnetUri - Magnet URI of the torrent
 * @param {HTMLVideoElement} videoElement - Video element to play the torrent in
 * @param {function} onProgress - Callback for progress updates: (data) => void
 * @returns {Promise} - Resolves when torrent is ready to play
 */
function streamTorrent(magnetUri, videoElement, onProgress) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Starting torrent: ${magnetUri}`);
      
      // Add the torrent
      const torrent = client.add(magnetUri, torrent => {
        console.log('Torrent added!');
        
        // Find the video file
        const file = torrent.files.find(file => {
          return file.name.endsWith('.mp4') || 
                 file.name.endsWith('.webm') || 
                 file.name.endsWith('.mkv') ||
                 file.name.endsWith('.avi');
        });

        if (!file) {
          console.error('No video file found in the torrent');
          reject(new Error('No video file found in the torrent'));
          return;
        }

        // Stream the file to the video element
        file.renderTo(videoElement);
        console.log('Video rendering started');
        
        // Store reference to the torrent
        activeTorrents[magnetUri] = {
          torrent,
          file,
          videoElement
        };
        
        resolve({
          torrent,
          file
        });
      });

      // Set up progress tracking
      torrent.on('download', () => {
        if (onProgress) {
          onProgress({
            progress: Math.round(torrent.progress * 100),
            downloadSpeed: torrent.downloadSpeed,
            uploadSpeed: torrent.uploadSpeed,
            numPeers: torrent.numPeers,
            timeRemaining: torrent.timeRemaining
          });
        }
      });

      torrent.on('done', () => {
        console.log('Torrent download complete');
        if (onProgress) {
          onProgress({
            progress: 100,
            downloadSpeed: torrent.downloadSpeed,
            uploadSpeed: torrent.uploadSpeed,
            numPeers: torrent.numPeers,
            timeRemaining: 0,
            complete: true
          });
        }
      });

      torrent.on('error', err => {
        console.error('Torrent error:', err);
        reject(err);
      });
      
    } catch (error) {
      console.error('Error streaming torrent:', error);
      reject(error);
    }
  });
}

/**
 * Stop a specific torrent
 * @param {string} magnetUri - Magnet URI of the torrent to stop
 */
function stopTorrent(magnetUri) {
  const torrentInfo = activeTorrents[magnetUri];
  if (torrentInfo) {
    client.remove(torrentInfo.torrent);
    delete activeTorrents[magnetUri];
    console.log(`Torrent removed: ${magnetUri}`);
  }
}

/**
 * Stop all active torrents
 */
function stopAllTorrents() {
  Object.keys(activeTorrents).forEach(magnetUri => {
    stopTorrent(magnetUri);
  });
  console.log('All torrents stopped');
}

/**
 * Get stats for all active torrents
 * @returns {Object} Stats for all torrents
 */
function getTorrentStats() {
  const stats = {};
  
  Object.keys(activeTorrents).forEach(magnetUri => {
    const { torrent } = activeTorrents[magnetUri];
    stats[magnetUri] = {
      progress: Math.round(torrent.progress * 100),
      downloadSpeed: torrent.downloadSpeed,
      uploadSpeed: torrent.uploadSpeed,
      numPeers: torrent.numPeers,
      timeRemaining: torrent.timeRemaining
    };
  });
  
  return stats;
}

// Export the functions
window.torrentService = {
  streamTorrent,
  stopTorrent,
  stopAllTorrents,
  getTorrentStats
};