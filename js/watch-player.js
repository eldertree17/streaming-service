/**
 * watch-player.js - Video player functionality for the streaming service
 * 
 * This module handles all video player related functionality including:
 * - Player initialization
 * - Playback controls
 * - UI elements (play buttons, loading indicators)
 * - Video event handling
 * - Debug functionality
 */

// Player state
let videoPlayer = null;
let forcePlayButton = null;
let playerState = {
    isPlaying: false,
    isLoading: false,
    hasError: false,
    isReady: false
};

// Public API - exposed to other modules
window.WatchPlayer = {
    initialize,
    loadVideoFromUrl,
    loadVideoFromFile,
    play,
    pause,
    stop,
    showPlayButton,
    hidePlayButton,
    setupDebugTools,
    addPlayButtonOverlay: showPlayButtonOverlay,
    captureFirstFrameAsThumbnail,
    setupPlayButton,
    monitorTorrentProgress
};

/**
 * Initialize the video player
 */
function initialize() {
    console.log('Initializing WatchPlayer module');
    videoPlayer = document.getElementById('video-player');
    
    if (!videoPlayer) {
        console.error('Video player element not found during initialization');
        return null;
    }
    
    // Make loadMovieDataFromAPI function globally available if it exists in watch.js
    // This helps our fetchMovieData function work properly
    try {
        // Check if the function exists in the window scope
        if (typeof loadMovieDataFromAPI === 'function' && !window.loadMovieDataFromAPI) {
            console.log('Making loadMovieDataFromAPI function globally accessible');
            window.loadMovieDataFromAPI = loadMovieDataFromAPI;
        }
    } catch (error) {
        console.log('Could not access loadMovieDataFromAPI function, using fallback');
    }
    
    if (window.location.search.includes('debug=true')) {
        addDebugButton();
    }
    
    // Set up torrent progress monitoring
    monitorTorrentProgress();
    
    return videoPlayer; // Return the player element for convenience
}

/**
 * Monitor torrent download progress and enable continue-seeding button when complete
 */
function monitorTorrentProgress() {
    console.log('Setting up torrent progress monitoring');
    
    // Use a MutationObserver to monitor changes to the progress bar width
    const progressBarObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const progressBar = document.getElementById('progress-bar');
                if (progressBar && progressBar.style.width === '100%') {
                    // Download is complete, enable the continue-seeding button
                    const continueButton = document.getElementById('btn-continue-seeding');
                    if (continueButton) {
                        continueButton.disabled = false;
                        console.log('Download complete, enabled Pause Seeding button');
                    }
                    
                    // Apply the completed class to the progress bar
                    progressBar.classList.add('completed');
                    
                    // Force the progress bar to be green
                    progressBar.style.backgroundColor = '#4CAF50';
                    progressBar.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.8)';
                    
                    // Also update the progress value text color
                    const progressValue = document.getElementById('torrent-progress');
                    if (progressValue) {
                        progressValue.style.color = '#4CAF50';
                    }
                    
                    // Show seeding notification
                    showSeedingNotification();
                }
            }
        });
    });
    
    // Also monitor global client for 'done' event
    document.addEventListener('DOMContentLoaded', function() {
        // Set up an interval to check for torrent client and monitor its state
        const torrentCheckInterval = setInterval(function() {
            // Check if we have an active torrent client
            if (window.client && window.client.torrents && window.client.torrents.length > 0) {
                const torrent = window.client.torrents[0];
                
                // If torrent is already done (100% progress), enable the button
                if (torrent.progress === 1) {
                    const continueButton = document.getElementById('btn-continue-seeding');
                    if (continueButton) {
                        continueButton.disabled = false;
                        console.log('Torrent already complete, enabled Pause Seeding button');
                    }
                    
                    // Force the progress bar to be green
                    const progressBar = document.getElementById('progress-bar');
                    if (progressBar) {
                        // Apply the completed class
                        progressBar.classList.add('completed');
                        
                        if (window.TorrentStats && typeof window.TorrentStats.forceGreenProgressBar === 'function') {
                            window.TorrentStats.forceGreenProgressBar();
                        } else {
                            progressBar.style.backgroundColor = '#4CAF50';
                            progressBar.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.8)';
                        }
                    }
                    
                    // Show seeding notification
                    showSeedingNotification();
                }
                
                // Add a 'done' event listener to the torrent
                if (!torrent._watchPlayerDoneListenerAdded) {
                    torrent._watchPlayerDoneListenerAdded = true;
                    
                    torrent.on('done', function() {
                        console.log('Torrent download completed from WatchPlayer module');
                        
                        // Enable the Pause Seeding button
                        const continueButton = document.getElementById('btn-continue-seeding');
                        if (continueButton) {
                            continueButton.disabled = false;
                            console.log('Pause Seeding button enabled from WatchPlayer module');
                        }
                        
                        // Apply completed class to the progress bar
                        const progressBar = document.getElementById('progress-bar');
                        if (progressBar) {
                            progressBar.classList.add('completed');
                        }
                        
                        // Show seeding notification
                        showSeedingNotification();
                    });
                }
                
                // Remove the interval once we've set everything up
                clearInterval(torrentCheckInterval);
            }
        }, 1000); // Check every second
    });
    
    // Start observing the progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBarObserver.observe(progressBar, { attributes: true });
    } else {
        // If no progress bar yet, wait for it to appear in the DOM
        const progressBarCheckInterval = setInterval(function() {
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
                progressBarObserver.observe(progressBar, { attributes: true });
                clearInterval(progressBarCheckInterval);
            }
        }, 1000); // Check every second
    }
}

/**
 * Show notification that seeding has begun
 */
function showSeedingNotification() {
    // Create a simple notification
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
    notification.style.transition = 'opacity 0.3s ease-in-out';
    
    notification.innerHTML = '<div style="display: flex; align-items: center;"><i class="fas fa-check-circle" style="margin-right: 10px;"></i>Download complete! Now seeding to others.</div>';
    
    document.body.appendChild(notification);
    
    // Remove after a few seconds
    setTimeout(function() {
        notification.style.opacity = '0';
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Set up the play button functionality
 */
function setupPlayButton() {
    const playButton = document.getElementById('play-button');
    
    // If video element doesn't exist, log error
    if (!document.getElementById('video-player')) {
        console.error('Video player element not found, cannot setup play button');
        return;
    }
    
    if (playButton) {
        // Handle play button click
        playButton.addEventListener('click', function() {
            // Immediately hide the play button and show loading indicator
            playButton.style.display = 'none';
            
            // Add loading-active class to ensure play button stays hidden
            const videoContainer = document.querySelector('.video-player');
            if (videoContainer) {
                videoContainer.classList.add('loading-active');
            }
            
            // Show loading indicator before starting video load
            showLoadingIndicator();
            
            // Start loading the video
            playVideo();
        });
    }
}

/**
 * General function to play the video
 */
function playVideo() {
    if (!this.videoElement) return;
    
    // Try to play and handle any autoplay restrictions
    const playPromise = this.videoElement.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            // Ignore abort errors from pause() calls
            if (error.name === 'AbortError') {
                console.log('Video playback paused');
                return;
            }
            
            // Handle other autoplay restrictions
            if (error.name === 'NotAllowedError') {
                console.log('Autoplay not allowed - waiting for user interaction');
                // Add a play button or other UI element if needed
                this.showPlayButton();
            }
        });
    }
}

/**
 * Show a force play button when autoplay is prevented
 */
function showForcePlayButton() {
    const videoContainer = document.querySelector('.video-player');
    if (!videoContainer) return;
    
    // Don't show the force play button if loading is active
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator && loadingIndicator.style.display === 'flex') {
        return;
    }
    
    // Remove any existing play buttons first
    const existingButtons = videoContainer.querySelectorAll('.play-button');
    existingButtons.forEach(button => button.remove());
    
    if (!forcePlayButton) {
        forcePlayButton = document.createElement('button');
        forcePlayButton.className = 'play-button';
        forcePlayButton.innerHTML = '<i class="fas fa-play"></i>';
        
        // Add event listener
        forcePlayButton.addEventListener('click', function() {
            forcePlayButton.style.display = 'none';
            videoPlayer.play();
            forcePlayButton.remove();
        });
        
        videoContainer.appendChild(forcePlayButton);
    }
}

/**
 * Show a larger play button overlay
 */
function showPlayButtonOverlay() {
    const videoContainer = document.querySelector('.video-player');
    if (!videoContainer) return;
    
    // Don't show the play button if loading is active
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator && loadingIndicator.style.display === 'flex') {
        return;
    }
    
    // Remove any existing overlay buttons first
    const existingButtons = videoContainer.querySelectorAll('.play-button');
    existingButtons.forEach(button => button.remove());
    
    // Create a new button using CSS classes instead of inline styles
    const playButtonOverlay = document.createElement('button');
    playButtonOverlay.className = 'play-button';
    playButtonOverlay.innerHTML = '<i class="fas fa-play"></i>';
    
    // Add click event to play the video and remove the button
    playButtonOverlay.addEventListener('click', function() {
        playButtonOverlay.style.display = 'none';
        videoPlayer.play();
        playButtonOverlay.remove();
    });
    
    // Add the button to the video container
    videoContainer.appendChild(playButtonOverlay);
}

/**
 * Load video from a URL
 * @param {string} url - URL of the video to load
 */
function loadVideoFromUrl(url) {
    if (!videoPlayer) {
        videoPlayer = document.getElementById('video-player');
    }
    
    if (videoPlayer) {
        // Show loading indicator immediately
        showLoadingIndicator();
        
        // Explicitly hide the play button
        const playButton = document.getElementById('play-button');
        if (playButton) {
            playButton.style.display = 'none';
        }
        
        // Reset video player state
        videoPlayer.pause();
        videoPlayer.removeAttribute('src');
        videoPlayer.removeAttribute('type');
        videoPlayer.load();
        
        // Reset event handlers
        videoPlayer.oncanplay = null;
        videoPlayer.onloadeddata = null;
        videoPlayer.onloadedmetadata = null;
        videoPlayer.onerror = null;
        
        // Setup event handlers
        videoPlayer.onloadeddata = function() {
            console.log('Video data loaded');
        };
        
        videoPlayer.oncanplay = function() {
            console.log('Video can play');
            hideLoadingIndicator();
        };
        
        // Setup playback event listeners
        videoPlayer.addEventListener('playing', function() {
            console.log('Video is playing');
            hideLoadingIndicator();
        });
        
        videoPlayer.addEventListener('waiting', function() {
            console.log('Video is buffering');
            showLoadingIndicator();
        });
        
        videoPlayer.addEventListener('stalled', function() {
            console.log('Video has stalled');
            showLoadingIndicator();
        });
        
        // Handle video errors
        videoPlayer.onerror = function(e) {
            console.error('Video error:', videoPlayer.error);
            console.error('Error code:', videoPlayer.error ? videoPlayer.error.code : 'unknown');
            console.error('Error message:', videoPlayer.error ? videoPlayer.error.message : 'unknown');
            
            // Alert user about the error
            alert('Error playing video: ' + (videoPlayer.error ? videoPlayer.error.message : 'unknown error'));
            
            // Reset UI
            hideLoadingIndicator();
            const playButton = document.getElementById('play-button');
            if (playButton) playButton.style.display = 'flex';
            videoPlayer.style.display = 'none';
        };
        
        // Set video source and start loading
        videoPlayer.setAttribute('type', 'video/mp4');
        videoPlayer.src = url;
        videoPlayer.load();
        
        // Show video player
        videoPlayer.style.display = 'block';
        
        // Try to play the video
        playVideo();
    }
}

/**
 * Load video from a WebTorrent file
 * @param {Object} file - WebTorrent file object
 */
function loadVideoFromFile(file) {
    console.log('WatchPlayer: Loading video from file object:', file ? file.name : 'unknown');
    
    if (!videoPlayer) {
        videoPlayer = document.getElementById('video-player');
    }
    
    if (videoPlayer && file) {
        // Show loading indicator while preparing the video
        showLoadingIndicator();
        
        // Explicitly hide the play button
        const playButton = document.getElementById('play-button');
        if (playButton) {
            playButton.style.display = 'none';
        }
        
        // Reset video player state
        videoPlayer.pause();
        videoPlayer.removeAttribute('src');
        videoPlayer.removeAttribute('type');
        videoPlayer.load();
        
        // Reset event handlers
        videoPlayer.oncanplay = null;
        videoPlayer.onloadeddata = null;
        videoPlayer.onloadedmetadata = null;
        videoPlayer.onerror = null;
        
        // Setup event handlers for video loading
        videoPlayer.onloadeddata = function() {
            console.log('Video data loaded successfully');
        };
        
        videoPlayer.oncanplay = function() {
            console.log('Video can now play');
            // Make sure video is visible
            videoPlayer.style.display = 'block';
            
            // Hide the video thumbnail and loading indicator
            hideLoadingIndicator();
            const videoThumbnail = document.querySelector('.video-thumbnail');
            if (videoThumbnail) {
                videoThumbnail.style.display = 'none';
            }
            
            // Try to play the video
            playVideo();
        };
        
        // Handle various video events
        videoPlayer.addEventListener('playing', function() {
            console.log('Video is playing');
            hideLoadingIndicator();
        });
        
        videoPlayer.addEventListener('waiting', function() {
            console.log('Video is buffering');
            showLoadingIndicator();
        });
        
        videoPlayer.addEventListener('stalled', function() {
            console.log('Video has stalled');
            showLoadingIndicator();
        });
        
        videoPlayer.addEventListener('ended', function() {
            console.log('Video playback ended');
            // Maybe show replay button or other UI elements
        });
        
        // Handle errors
        videoPlayer.onerror = function() {
            console.error('Error loading video:', videoPlayer.error);
            alert('Error loading video. Please try again.');
            
            // Reset UI
            hideLoadingIndicator();
            const playButton = document.getElementById('play-button');
            if (playButton) {
                playButton.style.display = 'flex';
            }
            videoPlayer.style.display = 'none';
        };
        
        // Create a blob URL if a file is provided
        if (typeof file !== 'string' && file.getBlobURL) {
            console.log('Getting blob URL from WebTorrent file');
            file.getBlobURL((err, blobUrl) => {
                if (err) {
                    console.error('Error getting blob URL:', err);
                    alert('Error loading video file: ' + err.message);
                    hideLoadingIndicator();
                    return;
                }
                
                console.log('Blob URL created successfully');
                
                // Store the blob URL for cleanup later
                window.blobUrl = blobUrl;
                
                // Set the video source
                videoPlayer.src = blobUrl;
                videoPlayer.load();
                
                // Show the video player
                videoPlayer.style.display = 'block';
            });
        } else if (typeof file.renderTo === 'function') {
            // Direct rendering (WebTorrent method)
            console.log('Rendering file directly to video element');
            try {
                file.renderTo(videoPlayer);
                videoPlayer.style.display = 'block';
            } catch (error) {
                console.error('Error rendering file to video element:', error);
                alert('Error loading video: ' + error.message);
                hideLoadingIndicator();
            }
        } else {
            console.error('Unsupported file object type');
            alert('Unsupported video format');
            hideLoadingIndicator();
        }
    } else {
        console.error('Video player not found or file object is invalid');
        alert('Error: Video player not initialized properly');
    }
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    // First, ensure the loading-active class is added to the video player container
    const videoContainer = document.querySelector('.video-player');
    if (videoContainer) {
        videoContainer.classList.add('loading-active');
    }
    
    // Force hide the main play button - improve hiding
    const playButton = document.getElementById('play-button');
    if (playButton) {
        playButton.style.display = 'none';
        playButton.style.visibility = 'hidden';
        playButton.style.opacity = '0';
        playButton.style.pointerEvents = 'none';
        
        // Use CSS important flag via class
        playButton.classList.add('force-hide');
    }
    
    // Make loading indicator visible
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
        loadingIndicator.style.opacity = '1';
        loadingIndicator.style.width = '120px';
        loadingIndicator.style.height = '120px';
        loadingIndicator.style.maxWidth = '120px';
        loadingIndicator.style.maxHeight = '120px';
        loadingIndicator.style.overflow = 'hidden';
        loadingIndicator.style.boxSizing = 'border-box';
    }
    
    // Remove any other play button overlays
    if (videoContainer) {
        const playButtons = videoContainer.querySelectorAll('.play-button:not(#play-button)');
        playButtons.forEach(button => {
            button.style.display = 'none';
            button.remove();
        });
    }
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // Remove loading-active class from the video player container
    const videoContainer = document.querySelector('.video-player');
    if (videoContainer) {
        videoContainer.classList.remove('loading-active');
    }
}

/**
 * Public method to play the video
 */
function play() {
    if (!videoPlayer) {
        videoPlayer = document.getElementById('video-player');
    }
    
    if (videoPlayer) {
        videoPlayer.play();
    }
}

/**
 * Public method to pause the video
 */
function pause() {
    if (!videoPlayer) {
        videoPlayer = document.getElementById('video-player');
    }
    
    if (videoPlayer) {
        videoPlayer.pause();
    }
}

/**
 * Public method to stop the video and reset
 */
function stop() {
    if (!videoPlayer) {
        videoPlayer = document.getElementById('video-player');
    }
    
    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
    }
}

/**
 * Public method to show the play button
 */
function showPlayButton() {
    // Create play button if it doesn't exist
    if (!this.playButton) {
        this.playButton = document.createElement('button');
        this.playButton.className = 'video-play-button';
        this.playButton.innerHTML = '<i class="fas fa-play"></i>';
        this.playButton.onclick = () => this.playVideo();
        this.videoElement.parentElement.appendChild(this.playButton);
    }
    this.playButton.style.display = 'block';
}

/**
 * Public method to hide the play button
 */
function hidePlayButton() {
    const playButton = document.getElementById('play-button');
    if (playButton) {
        playButton.style.display = 'none';
    }
}

/**
 * Add a debug button to help troubleshoot video issues
 */
function addDebugButton() {
    console.log('Adding video debug button');
    
    // Create a container for debug information
    const debugContainer = document.createElement('div');
    debugContainer.style.position = 'fixed';
    debugContainer.style.bottom = '10px';
    debugContainer.style.right = '10px';
    debugContainer.style.zIndex = '1000';
    
    // Create debug button
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Debug Video';
    debugButton.style.padding = '5px 10px';
    debugButton.style.backgroundColor = 'rgba(255,0,0,0.7)';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '4px';
    debugButton.style.cursor = 'pointer';
    
    debugButton.addEventListener('click', function() {
        // Get video element
        const videoPlayer = document.getElementById('video-player');
        document.querySelector('.video-player').appendChild(debugContainer);
        
        // Log video info
        console.log('Video element:', videoPlayer);
        console.log('Video display style:', videoPlayer.style.display);
        console.log('Video readyState:', videoPlayer.readyState);
        console.log('Video paused:', videoPlayer.paused);
        console.log('Video currentSrc:', videoPlayer.currentSrc);
        console.log('Video error:', videoPlayer.error);
        
        // Try to fix common issues
        videoPlayer.style.display = 'block';
        
        // Force play
        videoPlayer.play();
        
        // Show alert with info
        alert(`Video Debug Info:
            - ReadyState: ${videoPlayer.readyState}
            - Source: ${videoPlayer.currentSrc || 'none'}
            - Error: ${videoPlayer.error ? videoPlayer.error.code : 'none'}
            - Paused: ${videoPlayer.paused}
            - NetworkState: ${videoPlayer.networkState}
        `);
    });
    
    debugContainer.appendChild(debugButton);
    document.body.appendChild(debugContainer);
    console.log('Debug button added');
}

/**
 * Public method to setup debug tools
 */
function setupDebugTools() {
    addDebugButton();
}

/**
 * Capture the first frame of a video as a thumbnail
 * @param {HTMLVideoElement} videoElement - The video element to capture from
 * @param {HTMLImageElement} thumbnailElement - The image element to use as thumbnail
 */
function captureFirstFrameAsThumbnail(videoElement, thumbnailElement) {
  // Check if the video element is ready
  if (videoElement && videoElement.readyState >= 2) { // HAVE_CURRENT_DATA or better
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw the current frame to the canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas to a data URL and set it as the thumbnail source
    try {
      const dataUrl = canvas.toDataURL('image/jpeg');
      thumbnailElement.src = dataUrl;
      thumbnailElement.alt = 'Movie Thumbnail';
      console.log('Successfully captured first frame as thumbnail');
    } catch (error) {
      console.error('Error capturing thumbnail:', error);
    }
  } else {
    console.warn('Video not ready for thumbnail capture');
  }
}

// Add fetchMovieData function to window scope to fix the reference error in watch.js
window.fetchMovieData = function(contentId) {
    console.log('fetchMovieData called with contentId:', contentId);
    
    // First try to use the function from watch.js if it's been made global
    if (typeof window.loadMovieDataFromAPI === 'function') {
        console.log('Using loadMovieDataFromAPI from window scope');
        return window.loadMovieDataFromAPI(contentId).then(data => {
            // Fix magnetUri/magnetLink discrepancy if needed
            if (!data.magnetUri && data.magnetLink) {
                data.magnetUri = data.magnetLink;
            }
            return data;
        });
    }
    
    // Fallback implementation if we can't find or use the original function
    console.log('Using fallback implementation of fetchMovieData');
    return new Promise((resolve, reject) => {
        try {
            // Create a fallback object with the required properties
            const fallbackData = {
                _id: contentId || "sample-video-1",
                title: "Big Buck Bunny",
                description: "Big Buck Bunny is a short animated film by the Blender Institute, part of the Blender Foundation. It's a public domain test video that's widely used for testing video players.",
                posterImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
                // Include both magnetUri and magnetLink properties to handle either case
                magnetUri: "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent",
                magnetLink: "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent",
                genre: ["Animation", "Short", "Comedy", "Public Domain"],
                releaseYear: 2008,
                duration: "9m 56s",
                likes: 9999,
                dislikes: 0
            };
            
            // Log the fallback data to confirm it's working
            console.log('Resolving fetchMovieData with fallback data:', fallbackData);
            
            // Resolve with the fallback data
            setTimeout(() => resolve(fallbackData), 100); // Add a small delay to simulate API call
        } catch (error) {
            console.error('Error in fetchMovieData fallback:', error);
            reject(error);
        }
    });
};

// Don't automatically initialize on DOM load
// Instead, watch.js will call WatchPlayer.initialize() when needed
console.log('WatchPlayer module loaded and ready for use'); 