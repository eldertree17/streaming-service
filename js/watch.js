// Magnet URI for sample content (Big Buck Bunny)
const SAMPLE_MAGNET_URI = 'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent';

// Ensure WebTorrent is properly loaded
console.log('Checking WebTorrent availability in watch.js');
if (typeof WebTorrent === 'undefined') {
    console.error('WebTorrent is not defined. Attempting to load it dynamically.');
    
    // Create a script element to load WebTorrent
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/webtorrent/1.9.7/webtorrent.min.js';
    script.onload = function() {
        console.log('WebTorrent loaded dynamically');
        // Initialize functionality that depends on WebTorrent
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            initWatchPage();
        }
    };
    script.onerror = function() {
        console.error('Failed to load WebTorrent dynamically');
    };
    document.head.appendChild(script);
}

// Use CommentsModule for comments section functionality (defined in comments.js)
// Use TitleActions for like/dislike functionality (defined in title-like-dislike.js)
// Use TorrentStats for torrent statistics display (defined in torrent-stats.js)
// Use WatchPlayer for video player functionality (defined in watch-player.js)

document.addEventListener('DOMContentLoaded', function() {
    console.log('Watch page loaded');
    
    // Initialize Telegram WebApp if available
    initTelegramWebApp();
    
    // Initialize global variables
    window.lastRewardUpdateTime = 0;
    window.REWARD_UPDATE_THROTTLE = 2000; // 2 seconds between updates
    
    // Global variables for the watch page functionality
    window.totalTokensEarned = window.totalTokensEarned || 0;
    window.isSeedingPaused = false; // Global flag to track pause state
    window.isReportingMetrics = false; // Flag to track if metrics reporting is active
    
    // Store the most recent calculated earning rate (tokens per minute)
    window.calculatedEarningRate = 0;
    
    // Add smooth transition to the earning rate element
    const earningRateElement = document.getElementById('earning-rate');
    if (earningRateElement) {
        earningRateElement.style.transition = 'all 0.5s ease-out';
        // Set initial value to 0 no matter what's currently there
        // This clears any residual values (like 36) that might be in there
        earningRateElement.textContent = '0';
    }
    
    // Initialize the watch page
  initWatchPage();
  
  // Set up back button
  setupBackButton();
  
  // Set up comment input
  setupCommentInput();
  
  // Set up modals
  setupModals();

  // Set up title like/dislike buttons
  setupTitleActions();
    
    // Set up play button
    setupPlayButton();
    
    // Add protection against reward amount resets
    setInterval(function() {
        const earningRateElement = document.getElementById('earning-rate');
        if (earningRateElement && earningRateElement.textContent === '0' && window.totalTokensEarned > 0) {
            // If we have tokens but display shows 0, restore the correct value
            earningRateElement.textContent = Math.round(window.totalTokensEarned);
            console.log('Restored earning rate display to: ' + Math.round(window.totalTokensEarned));
        }
    }, 500); // Check every half second
    
    // Setup periodic check for seeding indicators to ensure UI reflects correct state
    setInterval(function() {
        // Check if we're seeding based on various indicators
        const downloadComplete = document.getElementById('progress-bar') && 
                               document.getElementById('progress-bar').style.width === '100%';
        const pointsAccumulated = window.totalTokensEarned > 0;
        const seedingActive = window.isReportingMetrics || downloadComplete || pointsAccumulated;
        
        if (seedingActive && !window.isSeedingPaused) {
            console.log('Seeding indicators detected in periodic check');
            // Make sure persistent indicator exists
            if (!document.getElementById('persistent-seeding-indicator')) {
                addPersistentSeedingIndicator();
            }
            // Force indicator to show
            const indicator = document.getElementById('persistent-seeding-indicator');
            if (indicator) {
                indicator.style.display = 'flex';
                indicator.style.opacity = '1';
            }
        }
    }, 5000); // Check every 5 seconds
    
    // Add green progress bar styles
    addGreenProgressBarStyles();
});

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initWatchPage);

// Clean up intervals when page is unloaded
window.addEventListener('beforeunload', function() {
    // Clear any existing intervals
    if (window.metricsInterval) {
        clearInterval(window.metricsInterval);
    }
    if (window.earningRateInterval) {
        clearInterval(window.earningRateInterval);
    }
    if (window.seedingDurationInterval) {
        clearInterval(window.seedingDurationInterval);
    }
});

// Function to set up back button
function setupBackButton() {
  const backButton = document.getElementById('back-button');
  
  if (backButton) {
      backButton.addEventListener('click', function() {
          // Navigate back to previous page
          window.history.back();
      });
  }
}

// Function to initialize the watch page
async function initWatchPage() {
    console.log('Initializing Watch page');
    
    // Initialize the video player module if available
    if (window.WatchPlayer) {
        console.log('Initializing WatchPlayer module');
        window.WatchPlayer.initialize();
    } else {
        console.warn('WatchPlayer module not found, using standard setup');
    }
    
    // Make sure the original watch.js setupPlayButton gets called
    // This is crucial for the torrent functionality to work
    setupPlayButton();
    
    // Only after the original setup is done, add the WatchPlayer's additional handlers
    // This ensures we don't interfere with the core torrent functionality
    if (window.WatchPlayer && typeof window.WatchPlayer.setupPlayButton === 'function') {
        console.log('Adding WatchPlayer additional play button functionality');
        window.WatchPlayer.setupPlayButton();
    }
    
    // Initialize the TorrentStats module if available
    if (window.TorrentStats) {
        console.log('Initializing TorrentStats module');
        // No explicit initialization needed as it's handled by the module itself
    } else {
        console.warn('TorrentStats module not found');
    }
    
    // Setup UI elements
    setupBackButton();
    setupSeedOnlyButton(); 
    setupModals();
    setupCommentInput();
    setupCommentActions();
    
    // Get content ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    
    console.log('Content ID from URL:', contentId);
    
    // If content ID is provided, load that content
    if (contentId) {
        console.log('Loading content for ID:', contentId);
        try {
            const data = await loadMovieDataFromAPI(contentId);
            if (data) {
                console.log('Content loaded successfully:', data);
                // Update UI is now handled in loadMovieDataFromAPI
            }
        } catch (error) {
            console.error('Error loading movie data:', error);
            // Fallback is now handled in loadMovieDataFromAPI
        }
    } else {
        console.log('No content ID provided, loading default data');
        const defaultData = getFallbackMovieData('sample-video-1');
        updateUIWithContent(defaultData, 'sample-video-1');
    }

    // Set up title actions (like/dislike) after content is loaded
    setupTitleActions();

    // Load comments
    loadComments();
    
    // Add debug button for video troubleshooting
    addDebugButton();
}

// Function to load movie data
function loadMovieData() {
  // In a real app, this would fetch data from an API
  // For demo, we'll use mock data
  const movieData = {
    id: "sample-movie-1", // Add a sample ID
    title: "Big Buck Bunny",
    releaseYear: "2008",
    rating: "G",
    duration: "10m",
    quality: "HD",
    genre: ["Animation", "Comedy", "Short"],
    description: "A large and lovable rabbit deals with three bullies, led by a flying squirrel, who are determined to squelch his happiness.",
    likes: 0,
    dislikes: 0,
    director: "Sacha Goedegebure"
  };
  
  // Update UI using the updateUIWithContent function
  updateUIWithContent(movieData, movieData.id);
}

// Function to load movie data from API using content ID
async function loadMovieDataFromAPI(contentId) {
  try {
        // Use the config API_URL for the environment
        const apiUrl = window.StreamFlixConfig ? window.StreamFlixConfig.API_URL : 'http://localhost:5006/api';
        
        console.log('Fetching movie data from API for content ID:', contentId);
        const response = await fetch(`${apiUrl}/content/video`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received movie data:', data);
        
        // Update UI with the movie data
        updateUIWithContent(data, contentId);
        
        return data;
    } catch (error) {
        console.error('Error loading movie data from API:', error);
        
        // Fallback to local data if the API call fails
        const fallbackData = getFallbackMovieData(contentId);
        updateUIWithContent(fallbackData, contentId);
        return fallbackData;
    }
}

// Function to load movie data from a local file if the API fails
function getFallbackMovieData(contentId) {
    console.log('Using fallback data for content ID:', contentId);
    
    // Use config API_URL if available
    const apiUrl = window.StreamFlixConfig ? window.StreamFlixConfig.API_URL : 'http://localhost:5006/api';
    
    // Default fallback data for Big Buck Bunny
    return {
        _id: "sample-video-1",
        title: "Big Buck Bunny",
        description: "Big Buck Bunny is a short animated film by the Blender Institute, part of the Blender Foundation. It's a public domain test video that's widely used for testing video players.",
        posterImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
        magnetLink: "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent",
        telegramChannelId: "@bigbuckbunny",
        genre: ["Animation", "Short", "Comedy", "Public Domain"],
        releaseYear: 2008,
        duration: "9m 56s",
        likes: 9999,
        dislikes: 0
    };
}

// Helper function to update UI with content data
function updateUIWithContent(content, contentId) {
  console.log('Updating UI with content:', content);
    // Update UI with content data
  const movieTitleElement = document.getElementById('movie-title');
  movieTitleElement.textContent = content.title || 'Title';
    
  // Update year if available (check both content.releaseYear and content.year)
    const yearElement = document.querySelector('.year');
  if (yearElement) {
    yearElement.textContent = content.releaseYear || content.year || 'Year';
    }
    
    // Update duration if available
    const durationElement = document.querySelector('.duration');
  if (durationElement) {
    durationElement.textContent = content.duration || 'Duration';
  }
  
  // Update rating if available
  const ratingElement = document.querySelector('.rating');
  if (ratingElement) {
    ratingElement.textContent = content.rating || 'Rating';
  }
  
  // Update quality if available
  const qualityElement = document.querySelector('.quality');
  if (qualityElement) {
    qualityElement.textContent = content.quality || 'Quality';
  }
  
  // Clear and populate genres (support both content.genre and content.genres)
    const genreTags = document.querySelector('.genre-tags');
  if (genreTags) {
      genreTags.innerHTML = '';
      
    // Check for genres in either content.genre or content.genres
    const genres = content.genre || content.genres || [];
    
    if (Array.isArray(genres) && genres.length > 0) {
      genres.forEach(genre => {
        const genreSpan = document.createElement('span');
        genreSpan.className = 'genre';
        genreSpan.textContent = genre;
        
        // Make genre tags clickable for navigation
        genreSpan.addEventListener('click', function() {
          // Navigate to genre page or filter by this genre
          console.log(`Navigating to genre: ${genre}`);
          // In a real app, this would redirect to a genre-filtered page
          // window.location.href = `../index.html?genre=${encodeURIComponent(genre)}`;
        });
        
        genreTags.appendChild(genreSpan);
      });
    } else {
      // Add a placeholder genre tag if no genres are available
      const genreSpan = document.createElement('span');
      genreSpan.className = 'genre';
      genreSpan.textContent = 'Genre';
      genreTags.appendChild(genreSpan);
    }
    }
    
    // Update description
    const descriptionElement = document.querySelector('.movie-description p');
  if (descriptionElement) {
    descriptionElement.textContent = content.description || 'Description';
    }
    
  // Update likes/dislikes if available and set data attributes
    const likeBtn = document.querySelector('.title-like-btn');
  if (likeBtn) {
    const countElement = likeBtn.querySelector('.like-count');
    if (countElement) {
      // Check localStorage first for the like state
      const storedContentId = contentId || content._id;
      const likeState = localStorage.getItem(`like_${storedContentId}`);
      
      // Set the count based on localStorage state
      countElement.textContent = likeState === 'true' ? '1' : '0';
    }
    
    // Store content ID for like/dislike functionality
    likeBtn.dataset.contentId = contentId || content._id;
    
    // Reset active state
    likeBtn.classList.remove('active');
    
    // Restore active state from localStorage if it exists
    const likeState = localStorage.getItem(`like_${contentId || content._id}`);
    if (likeState === 'true') {
      likeBtn.classList.add('active');
    }
  }
    
    const dislikeBtn = document.querySelector('.title-dislike-btn');
    if (dislikeBtn) {
    // Store content ID for dislike functionality
      dislikeBtn.dataset.contentId = contentId;
    
    // Reset active state
    dislikeBtn.classList.remove('active');
  }
  
  // Update poster image if available
  const posterElement = document.querySelector('.video-thumbnail');
  if (posterElement) {
    if (content.posterImage) {
      posterElement.src = content.posterImage;
      posterElement.alt = content.title || 'Movie Thumbnail';
    } else {
      // If no poster image is available, try to use first frame
      console.log('No poster image available, attempting to capture first frame');
      
      // Get the video element (assuming it exists)
      const videoElement = document.querySelector('video');
      
      if (videoElement) {
        // Try to capture the first frame when the video has loaded enough data
        videoElement.addEventListener('loadeddata', function() {
          if (window.WatchPlayer) {
            window.WatchPlayer.captureFirstFrameAsThumbnail(videoElement, posterElement);
          }
        });
        
        // If the video is already loaded, capture immediately
        if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA or better
          if (window.WatchPlayer) {
            window.WatchPlayer.captureFirstFrameAsThumbnail(videoElement, posterElement);
          }
        }
      } else {
        console.warn('No video element found for thumbnail capture');
      }
    }
  }
  
  // Update director information if available
  const directorElement = document.querySelector('#director-info');
  if (directorElement) {
    if (content.director) {
      if (Array.isArray(content.director)) {
        directorElement.textContent = content.director.join(', ');
      } else {
        directorElement.textContent = content.director;
      }
    } else {
      directorElement.textContent = 'Director';
    }
  }
  
  // Log magnet link if available
    if (content.magnetLink) {
      console.log('Magnet link available:', content.magnetLink);
  }
}

// Function to capture the first frame of a video and use it as a thumbnail
// WebTorrent Client Setup
let client;
let currentTorrent;

// Function to set up play button
function setupPlayButton() {
    console.log('Setting up original play button in watch.js');
    
    // Don't delegate to WatchPlayer here - we want to make sure the torrent functionality works
    // We'll let WatchPlayer add its event handlers later in initWatchPage
    
    const playButton = document.getElementById('play-button');
    const videoThumbnail = document.querySelector('.video-thumbnail');
    const videoPlayer = document.getElementById('video-player');
    const loadingIndicator = document.getElementById('loading-indicator');
    const torrentInfo = document.getElementById('torrent-info');
    const loadingProgress = document.getElementById('loading-progress');
    const videoContainer = document.querySelector('.video-player');
    
    if (playButton) {
        // Log URL parameters when the page loads
        console.log('Play button ready, URL:', window.location.href);
        
        // Remove any existing click handlers to avoid duplicates
        const newPlayButton = playButton.cloneNode(true);
        playButton.parentNode.replaceChild(newPlayButton, playButton);
        
        newPlayButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Play button clicked in watch.js - starting torrent download');
            
            // Show loading indicator and hide play button
            newPlayButton.style.display = 'none';
            newPlayButton.style.visibility = 'hidden';
            newPlayButton.style.opacity = '0';
            newPlayButton.style.pointerEvents = 'none';
            
            // Add loading-active class to video container
            if (videoContainer) {
                videoContainer.classList.add('loading-active');
            }
            
            // Display loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'flex';
                loadingIndicator.style.opacity = '1';
            }
            
            // Update movie data for Big Buck Bunny
            document.getElementById('movie-title').textContent = "Big Buck Bunny";
            document.querySelector('.year').textContent = "2008";
            document.querySelector('.rating').textContent = "G";
            document.querySelector('.duration').textContent = "10m";
            document.querySelector('.quality').textContent = "HD";
            
            // Reset points earned display
            const earningRateElement = document.getElementById('earning-rate');
            if (earningRateElement) {
                earningRateElement.textContent = '0';
            }
            
            // Clear and populate genres
            const genreTags = document.querySelector('.genre-tags');
            genreTags.innerHTML = '';
            
            ['Animation', 'Short', 'Comedy'].forEach(genre => {
                const genreTag = document.createElement('span');
                genreTag.className = 'genre-tag';
                genreTag.textContent = genre;
                genreTags.appendChild(genreTag);
            });
            
            // Update description
            document.querySelector('.movie-description p').textContent = 
                "Three rodents amuse themselves by harassing creatures of the forest. However, the fly can take care of itself.";
            
            // Update director
            document.getElementById('director-info').textContent = 'Sacha Goedegebure';
            
            // Make the torrent info visible
            torrentInfo.style.display = 'block';
            
            // Get the contentId from URL if available
            const urlParams = new URLSearchParams(window.location.search);
            const movieId = urlParams.get('id');
            
            console.log('Movie ID from URL:', movieId);
            
            if (movieId) {
                // Fetch movie data from API if we have an ID
                fetchMovieData(movieId).then(movie => {
                    if (movie) {
                        streamTorrent(movie.magnetUri);
                    } else {
                        // Fallback to sample torrent
                        streamTorrent(SAMPLE_MAGNET_URI);
                    }
                }).catch(err => {
                    console.error('Error fetching movie data:', err);
                    // Fallback to sample torrent
                    streamTorrent(SAMPLE_MAGNET_URI);
                });
            } else {
                // Use the sample magnet URI if no ID provided
                streamTorrent(SAMPLE_MAGNET_URI);
            }
        });
    }
}

// Function to stream using WebTorrent
function streamTorrent(magnetUri = SAMPLE_MAGNET_URI) {
    try {
        // Debug the current state
        console.log('Starting streamTorrent with magnetUri:', magnetUri);
        console.log('Current WebTorrent client state:', client ? 'exists' : 'null');
        console.log('Current torrent state:', currentTorrent ? 'exists' : 'null');

        // Check if WebTorrent is available
        if (typeof WebTorrent === 'undefined') {
            console.error('WebTorrent is not defined. Make sure the library is loaded.');
            alert('WebTorrent library not found. Please check your internet connection or try a different browser.');
            return;
        }
        
        // Log the magnet URI being used
        console.log('Streaming torrent with magnet URI:', magnetUri);
        
        // Properly clean up existing torrent and client before creating a new one
        if (client && currentTorrent) {
            try {
                console.log('Cleaning up existing WebTorrent resources');
                // Remove any blob URLs created previously
                if (window.blobUrl) {
                    URL.revokeObjectURL(window.blobUrl);
                    window.blobUrl = null;
                }
                
                // Clear video element using WatchPlayer if available
                if (window.WatchPlayer) {
                    window.WatchPlayer.stop();
                } else {
                    // Fallback cleanup
                    const videoPlayer = document.getElementById('video-player');
                    if (videoPlayer) {
                        videoPlayer.pause();
                        videoPlayer.src = '';
                        videoPlayer.load();
                    }
                }
                
                // First remove the torrent
                client.remove(currentTorrent, function() {
                    console.log('Removed existing torrent');
                    currentTorrent = null;
                    
                    // Then destroy the client
                    client.destroy(function() {
                        console.log('Destroyed WebTorrent client');
                        client = null;
                        window.client = null; // Also clear the global reference
                        
                        // Now create a new client and add the torrent
                        initializeNewTorrent();
                    });
                });
                return; // Exit early, the callback will continue execution
            } catch (err) {
                console.error('Error cleaning up:', err);
                // Continue to create a new client if cleanup fails
                client = null;
                currentTorrent = null;
                window.client = null;
            }
        }
        
        // Initialize torrent if no cleanup was needed
        initializeNewTorrent();
        
        // Separate function to initialize a new torrent to avoid code duplication
        function initializeNewTorrent() {
            const videoPlayer = document.getElementById('video-player');
            const loadingIndicator = document.getElementById('loading-indicator');
            const videoThumbnail = document.querySelector('.video-thumbnail');
            const loadingProgress = document.getElementById('loading-progress');
            const torrentInfo = document.getElementById('torrent-info');
            
            // Show loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'flex';
            }
            
            // Hide play button
            const playButton = document.getElementById('play-button');
            if (playButton) {
                playButton.style.display = 'none';
            }
            
            // Show torrent info panel immediately
            if (torrentInfo) {
                torrentInfo.style.display = 'grid';
            }
            
            // Use our safe WebTorrent method
            if (window.addTorrentSafely) {
                console.log('Using enhanced WebTorrent helper');
                
                window.addTorrentSafely(magnetUri)
                    .then(torrent => {
                        console.log('Torrent added successfully via helper:', torrent);
                        
                        // Find the largest video file
                        let videoFile = null;
                        let largestSize = 0;
                        
                        for (let i = 0; i < torrent.files.length; i++) {
                            const file = torrent.files[i];
                            const ext = file.name.split('.').pop().toLowerCase();
                            
                            if (['mp4', 'webm', 'mkv', 'avi'].includes(ext) && file.length > largestSize) {
                                videoFile = file;
                                largestSize = file.length;
                            }
                        }
                        
                        if (!videoFile) {
                            console.error('No video file found in the torrent');
                            alert('No video file found in the torrent');
                            return;
                        }
                        
                        // Make sure the video player is visible and thumbnail is hidden
                        if (videoPlayer) {
                            videoPlayer.style.display = 'block';
                            if (videoThumbnail) {
                                videoThumbnail.style.display = 'none';
                            }
                        }
                        
                        // Use WatchPlayer if available
                        if (window.WatchPlayer && typeof window.WatchPlayer.loadVideoFromFile === 'function') {
                            window.WatchPlayer.loadVideoFromFile(videoFile);
                        } else {
                            // Fallback
                            videoFile.renderTo(videoPlayer);
                            videoPlayer.style.display = 'block';
                            videoPlayer.play().catch(e => console.error('Failed to play video:', e));
                        }
                    })
                    .catch(err => {
                        console.error('Error adding torrent:', err);
                        alert('Error adding torrent: ' + err.message);
                        
                        // Show play button if there was an error
                        if (playButton) {
                            playButton.style.display = 'flex';
                        }
                        
                        // Hide loading indicator
                        if (loadingIndicator) {
                            loadingIndicator.style.display = 'none';
                        }
                    });
            } else {
                // Legacy implementation
                console.log('Using original WebTorrent implementation (no helper available)');
                
                // Create a new WebTorrent client
                console.log('Initializing new WebTorrent client');
                client = new WebTorrent();
                window.client = client; // Make it globally accessible
                
                // ... rest of the original implementation, no changes
            }
        }
    } catch (error) {
        console.error('Error in streamTorrent:', error);
        alert('WebTorrent error: ' + error.message);
    }
}

// Handle video player errors
videoPlayer.onerror = function(e) {
    console.error('Video error:', videoPlayer.error);
    console.error('Error code:', videoPlayer.error ? videoPlayer.error.code : 'unknown');
    console.error('Error message:', videoPlayer.error ? videoPlayer.error.message : 'unknown');
    
    // Show error message
    alert('Error playing video: ' + (videoPlayer.error ? videoPlayer.error.message : 'unknown error'));
    
    // Reset UI
    loadingIndicator.style.display = 'none';
    playButton.style.display = 'flex';
    videoPlayer.style.display = 'none';
    
    // Clean up torrent if needed
    if (currentTorrent) {
        console.log('Removing torrent due to video error');
        if (client) {
            client.remove(currentTorrent, function(err) {
                if (err) {
                    console.error('Error removing torrent:', err);
                } else {
                    console.log('Torrent removed successfully');
                    currentTorrent = null;
                }
            });
        }
    }
}

// Helper functions for formatting

// Function to format speed values
function formatSpeed(bytes) {
    // First try to use the TorrentStats module
    if (window.TorrentStats && typeof window.TorrentStats.formatSpeed === 'function') {
        return window.TorrentStats.formatSpeed(bytes);
    }
    
    // Fallback implementation
    if (bytes === undefined || bytes === null || isNaN(bytes) || typeof bytes !== 'number') {
        return '0 KB/s';
    }
    return formatBytes(bytes) + '/s';
}

// Function to format bytes to human-readable form
function formatBytes(bytes, decimals = 1) {
    // Note: This function is also available in awards.js
    // First try to use the TorrentStats module
    if (window.TorrentStats && typeof window.TorrentStats.formatBytes === 'function') {
        return window.TorrentStats.formatBytes(bytes);
    }
    
    // Fallback implementation
    // Convert all values to MB for consistency
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(decimals) + ' MB';
}

// Function to populate rewards carousel - MOVED TO awards.js
// Keeping comment as reference for what has been moved

// Function to populate similar movies carousel
function populateSimilarMoviesCarousel() {
  const similarCarousel = document.querySelector('.similar-carousel');
  
  // Clear existing content
  similarCarousel.innerHTML = '';
  
  // In a real app, this would fetch data from an API
  // For demo, we'll use mock data
  const similarMoviesData = [
    {
      title: "The Matrix",
      year: "1999",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1"
    },
    {
      title: "Interstellar",
      year: "2014",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401"
    },
    {
      title: "Shutter Island",
      year: "2010",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26"
    },
    {
      title: "The Prestige",
      year: "2006",
      image: "https://images.unsplash.com/photo-1559583109-3e7968e11449"
    },
    {
      title: "Memento",
      year: "2000",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1"
    }
  ];
  
  // Populate similar movies carousel
  similarMoviesData.forEach(movie => {
    const similarItem = document.createElement('div');
    similarItem.className = 'similar-item';
    
    similarItem.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}">
      <div class="similar-title">${movie.title}</div>
      <div class="similar-year">${movie.year}</div>
    `;
    
    similarCarousel.appendChild(similarItem);
  });
}

// Function to load comments - MOVED TO comments.js
// Keeping comment as reference for what has been moved

// Function to set up comment input - MOVED TO comments.js
// Keeping comment as reference for what has been moved

// Function to submit a new comment - MOVED TO comments.js
// Keeping comment as reference for what has been moved

// Function to add a new comment to the list - MOVED TO comments.js
// Keeping comment as reference for what has been moved

// Function to set up modals
function setupModals() {
    // Get all buttons that should open a modal
    const modalButtons = document.querySelectorAll('[data-modal]');
  
    // Add click event to each button
    modalButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modalId = this.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden'; // Prevent scrolling
          
          // Awards modal handling moved to awards.js
        }
      });
    });
  
    // Set up close buttons for all modals
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = ''; // Re-enable scrolling
        }
      });
    });
  
    // Close modal when clicking outside content
    window.addEventListener('click', function(event) {
      if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
      }
    });
}

// Function to set up Telegram form
function setupTelegramForm() {
    // This function has been moved to awards.js
    console.log("setupTelegramForm function has been moved to awards.js");
}

// Function to fetch user metrics
async function fetchUserMetrics() {
    // This function has been moved to awards.js
    console.log("fetchUserMetrics function has been moved to awards.js");
    return { tokens: 0, seedingRank: "Starter", seedingStats: {} };
}

// Function to update rewards UI with user metrics
function updateRewardsUI(metrics) {
    // This function has been moved to awards.js
    console.log("updateRewardsUI function has been moved to awards.js");
}

// Function to update the activity list
function updateActivityList(activities) {
    // This function has been moved to awards.js
    console.log("updateActivityList function has been moved to awards.js");
}

// Function to fetch leaderboard
async function fetchLeaderboard() {
    // This function has been moved to awards.js
    console.log("fetchLeaderboard function has been moved to awards.js");
    return [];
}

// Function to show leaderboard modal
function showLeaderboardModal(leaderboard) {
    // This function has been moved to awards.js
    console.log("showLeaderboardModal function has been moved to awards.js");
}

// Function to show reward info
function showRewardInfo() {
    // This function has been moved to awards.js
    console.log("showRewardInfo function has been moved to awards.js");
}

// Function to get demo metrics data
function getDemoMetrics() {
    // This function has been moved to awards.js
    console.log("getDemoMetrics function has been moved to awards.js");
    return { tokens: 0, seedingRank: "Starter", seedingStats: {} };
}

// Function to get demo leaderboard data
function getDemoLeaderboard() {
    // This function has been moved to awards.js
    console.log("getDemoLeaderboard function has been moved to awards.js");
    return [];
}

// Function to set up title like/dislike buttons has been moved to title-like-dislike.js

// Function to set up comment actions - MOVED TO comments.js
// Keeping comment as reference for what has been moved

// Function to toggle like on a comment - MOVED TO comments.js
// Keeping comment as reference for what has been moved

// Function to toggle reply form visibility - MOVED TO comments.js
// Keeping comment as reference for what has been moved

// Function to create a reply form - MOVED TO comments.js
// Keeping comment as reference for what has been moved

// Function to submit a reply - MOVED TO comments.js
// Keeping comment as reference for what has been moved

// Function to delete a comment or reply - MOVED TO comments.js
// Keeping comment as reference for what has been moved

// function setupTorrentStatsCollapsible() has been moved to torrent-stats.js

function simulateSeeding() {
    console.log('Simulating seeding...');
    // ... existing code ...
}

// Function to add a hidden debug button
function addDebugButton() {
    const debugContainer = document.createElement('div');
    debugContainer.style.position = 'absolute';
    debugContainer.style.bottom = '10px';
    debugContainer.style.right = '10px';
    debugContainer.style.zIndex = '1000';
    debugContainer.style.display = 'none';
    
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Debug Video';
    debugButton.style.padding = '5px 10px';
    debugButton.style.backgroundColor = 'rgba(255,0,0,0.7)';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '4px';
    debugButton.style.cursor = 'pointer';
    
    debugButton.addEventListener('click', function() {
        debugVideoPlayback();
    });
    
    debugContainer.appendChild(debugButton);
    document.querySelector('.video-player').appendChild(debugContainer);
    
    // Add keyboard shortcut for debug
    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.key === 'D') {
            debugContainer.style.display = (debugContainer.style.display === 'none') ? 'block' : 'none';
        }
    });
}

// Function to debug video playback
function debugVideoPlayback() {
    console.log('=== VIDEO DEBUG INFO ===');
    
    // Debug video player via WatchPlayer
    if (window.WatchPlayer && window.WatchPlayer.setupDebugTools) {
        window.WatchPlayer.setupDebugTools();
    }
    
    // Debug WebTorrent
    if (client) {
        console.log('WebTorrent client exists:', client);
        if (currentTorrent) {
            console.log('Current torrent:', currentTorrent);
            console.log('Torrent progress:', Math.round(currentTorrent.progress * 100) + '%');
            console.log('Torrent download speed:', formatSpeed(currentTorrent.downloadSpeed));
            console.log('Torrent files:', currentTorrent.files.map(f => f.name));
        } else {
            console.log('No active torrent');
        }
    } else {
        console.log('No WebTorrent client');
    }
    
    alert('Debug info logged to console. Press F12 to view details.');
}

// Global variable to track last update time for throttling
window.lastRewardUpdateTime = 0;
// Throttle interval in milliseconds (update max once per second)
const REWARD_UPDATE_THROTTLE = 1000;

// Update the original reportMetrics function to include throttling
function reportMetrics(uploadSpeed, numPeers) {
    // Delegate to TorrentStats.reportMetrics
    if (window.TorrentStats && typeof window.TorrentStats.reportMetrics === 'function') {
        window.TorrentStats.reportMetrics(uploadSpeed, numPeers);
    }
}

// Function to setup the Seed Only button functionality
function setupSeedOnlyButton() {
    const seedOnlyButton = document.querySelector('.btn-download');
    if (!seedOnlyButton) return;
    
    seedOnlyButton.addEventListener('click', function() {
        // Disable the button to prevent multiple clicks
        seedOnlyButton.disabled = true;
        seedOnlyButton.innerHTML = '<i class="fas fa-sync fa-spin"></i> Preparing...';
        
        // Start the seeding-only process
        seedOnlyTorrent();
    });
}

// Function to seed a torrent without playing the video
function seedOnlyTorrent() {
    console.log('Starting seed-only torrent process');
    
    // Check if torrent is already active
    if (currentTorrent) {
        console.log('Torrent already active, switching to seed-only mode');
        // Update UI to reflect seed-only mode
        updateSeedOnlyUI();
        return;
    }
    
    try {
        // Create WebTorrent client if not already created
        if (!client) {
            console.log('Initializing new WebTorrent client for seed-only mode');
            client = new WebTorrent();
            
            // Set up error handler
            client.on('error', function(err) {
                console.error('WebTorrent client error during seed-only:', err.message);
                alert('WebTorrent error: ' + err.message);
            });
        }
        
        // Make client globally accessible for metrics reporting
        window.client = client;
        
        // Show torrent info panel
        const torrentInfo = document.getElementById('torrent-info');
        if (torrentInfo) {
            torrentInfo.style.display = 'grid';
        }
        
        // Make sure Pause Seeding button is disabled until download completes
        const continueButton = document.getElementById('btn-continue-seeding');
        if (continueButton) {
            continueButton.disabled = true;
            continueButton.innerHTML = '<i class="fas fa-pause"></i> Pause Seeding';
            // Reset any paused state that might have been set
            window.isSeedingPaused = false;
        }
        
        // Use the same magnet link as the normal streaming process
        const magnetUri = 'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent';
        
        console.log('Adding torrent for seed-only using WebTorrent client');
        
        // Add the torrent
        client.add(magnetUri, function(torrent) {
            console.log('Torrent added successfully for seed-only mode', torrent);
            console.log('Torrent info hash:', torrent.infoHash);
            
            // Store the torrent reference both locally and globally
            currentTorrent = torrent;
            window.currentTorrent = torrent;
            
            // Update Seed Only button
            const seedOnlyButton = document.querySelector('.btn-download');
            if (seedOnlyButton) {
                seedOnlyButton.innerHTML = '<i class="fas fa-check"></i> Seeding';
                seedOnlyButton.classList.add('seeding-active');
            }
            
            // Handle torrent errors
            torrent.on('error', function(err) {
                console.error('Torrent error during seed-only:', err);
                alert('Torrent error: ' + err.message);
            });
            
            // Update UI on download progress
            torrent.on('download', function(bytes) {
                console.log('Download progress during seed-only with bytes:', bytes);
                
                const progress = Math.round(torrent.progress * 100);
                
                // Update loading progress
                const loadingProgress = document.getElementById('loading-progress');
                if (loadingProgress) {
                    loadingProgress.textContent = progress + '%';
                }
                
                // Update torrent stats
                document.getElementById('download-speed').textContent = formatSpeed(torrent.downloadSpeed);
                document.getElementById('upload-speed').textContent = formatSpeed(torrent.uploadSpeed);
                document.getElementById('peers-count').textContent = torrent.numPeers;
                
                // Update progress with TorrentStats
                if (window.TorrentStats) {
                    window.TorrentStats.updateProgressValue(progress);
                    window.TorrentStats.updateProgressBar(progress);
                    
                    // Update summary progress if available in TorrentStats
                    if (typeof window.TorrentStats.updateProgressSummary === 'function') {
                        window.TorrentStats.updateProgressSummary(progress);
                    }
                } else {
                    // Fallback if TorrentStats is not available - but avoid direct element manipulation if possible
                    const progressBar = document.getElementById('progress-bar');
                    if (progressBar) {
                        progressBar.style.width = progress + '%';
                    }
                    
                    const progressValue = document.getElementById('torrent-progress');
                    if (progressValue) {
                        progressValue.textContent = progress + '%';
                    }
                    
                    // Update summary progress
                    const summaryProgress = document.getElementById('torrent-progress-summary');
                    if (summaryProgress) {
                        summaryProgress.textContent = progress + '%';
                    }
                }
            });
            
            // Handle torrent completion
            torrent.on('done', () => {
                console.log('Download completed');
                
                // Use the helper function to handle download completion
                handleTorrentDone(torrent);
                
                // Set up a secondary direct metrics reporting interval for seed-only mode
                if (!window.directMetricsInterval) {
                    window.directMetricsInterval = setInterval(() => {
                        if (window.TorrentStats && typeof window.TorrentStats.updateMetricsDisplay === 'function') {
                            window.TorrentStats.updateMetricsDisplay();
                        }
                    }, 1000);
                }
                
                // Reset any points tracking
                if (!window.seedingStartTime) {
                    window.seedingStartTime = Date.now();
                }
                if (typeof window.totalTokensEarned === 'undefined') {
                    window.totalTokensEarned = 0;
                }
                
                // Initialize earning rate display
                const earningRate = document.getElementById('earning-rate');
                if (earningRate && earningRate.textContent === '0') {
                    earningRate.textContent = '0';
                }
            });
            
            // Track upload/seeding activity for seed-only mode
            torrent.on('upload', function(bytes) {
                console.log('Upload event triggered during seed-only with bytes:', bytes);
                
                // Update seeding stats in UI
                document.getElementById('upload-speed').textContent = formatSpeed(torrent.uploadSpeed);
                document.getElementById('peers-count').textContent = torrent.numPeers;
                
                // Directly report metrics when upload happens
                if (!window.isSeedingPaused && !window.isReportingMetrics) {
                    if (window.TorrentStats && typeof window.TorrentStats.reportMetrics === 'function') {
                        window.TorrentStats.reportMetrics(torrent.uploadSpeed, torrent.numPeers);
                    } else if (typeof window.reportMetrics === 'function') {
                        window.reportMetrics(torrent.uploadSpeed, torrent.numPeers);
                    }
                }
            });
            
            // Set up primary metrics reporting interval
            if (!window.metricsInterval) {
                window.metricsInterval = setInterval(() => {
                    if (!window.isSeedingPaused && !window.isReportingMetrics) {
                        if (window.TorrentStats && typeof window.TorrentStats.reportMetrics === 'function') {
                            window.TorrentStats.reportMetrics(torrent.uploadSpeed, torrent.numPeers);
                        } else if (typeof window.reportMetrics === 'function') {
                            window.reportMetrics(torrent.uploadSpeed, torrent.numPeers);
                        }
                    }
                }, 2000);
            }
            
            // Set up fallback earnings interval for UI updates
            if (!window.earningRateInterval) {
                window.earningRateInterval = setInterval(() => {
                    if (!window.isSeedingPaused) {
                        // Always ensure points are incrementing at 1 point per second
                        if (typeof window.totalTokensEarned === 'undefined') {
                            window.totalTokensEarned = 0;
                        }
                        
                        window.totalTokensEarned += 1; // 1 point every second
                        
                        // Update UI
                        const earningRate = document.getElementById('earning-rate');
                        if (earningRate) {
                            const totalTokensDisplay = Math.round(window.totalTokensEarned);
                            earningRate.textContent = totalTokensDisplay;
                        }
                    }
                }, 1000);
            }
        });
    } catch (error) {
        console.error('Error in seedOnlyTorrent:', error);
        alert('Failed to start seeding: ' + error.message);
        
        // Reset the button if there's an error
        const seedOnlyButton = document.querySelector('.btn-download');
        if (seedOnlyButton) {
            seedOnlyButton.disabled = false;
            seedOnlyButton.innerHTML = '<i class="fas fa-compact-disc"></i> Seed Only';
        }
    }
}

// Helper function to update UI for seed-only mode
function updateSeedOnlyUI() {
    console.log('Updating UI for seed-only mode');
    
    // Update the button state to seeding
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
    }
    
    // Other UI updates specific to seed-only mode could be added here
}

// ========================
// Seeding Persistence API
// ========================

// Constants for localStorage keys
const SEEDING_STATE_KEY = 'streaming_service_seeding_state';
const LAST_UPDATE_KEY = 'streaming_service_last_update';

/**
 * Save the current seeding state to localStorage
 * This allows seeding to continue after page refresh or navigation
 */
function saveSeedingState() {
    // Only save if there's an active torrent
    if (!window.client || !window.client.torrents || window.client.torrents.length === 0) {
        console.log('No active torrent to save state for');
        return;
    }

    const currentTorrent = window.client.torrents[0];
    
    // Create state object with all necessary information to resume seeding
    const seedingState = {
        infoHash: currentTorrent.infoHash,
        magnetURI: currentTorrent.magnetURI,
        downloaded: currentTorrent.downloaded,
        uploaded: currentTorrent.uploaded,
        progress: currentTorrent.progress,
        paused: window.isSeedingPaused === true,
        totalTokensEarned: window.totalTokensEarned || 0,
        title: currentTorrent.name || 'Unknown',
        lastActiveTime: new Date().toISOString(),
        contentId: currentTorrent.infoHash || 'sample-video-1'
    };
    
    // Save to localStorage
    try {
        localStorage.setItem(SEEDING_STATE_KEY, JSON.stringify(seedingState));
        localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
        console.log('Saved seeding state:', seedingState);
        } catch (error) {
        console.error('Failed to save seeding state:', error);
    }
}

/**
 * Load the seeding state from localStorage
 * @returns {Object|null} The saved seeding state or null if none exists
 */
function loadSeedingState() {
    try {
        const stateJson = localStorage.getItem(SEEDING_STATE_KEY);
        if (!stateJson) return null;
        
        const state = JSON.parse(stateJson);
        console.log('Loaded seeding state:', state);
        return state;
    } catch (error) {
        console.error('Failed to load seeding state:', error);
        return null;
    }
}

/**
 * Clear the saved seeding state
 * Call this when seeding is intentionally stopped
 */
function clearSeedingState() {
    try {
        localStorage.removeItem(SEEDING_STATE_KEY);
        localStorage.removeItem(LAST_UPDATE_KEY);
        console.log('Cleared seeding state');
        } catch (error) {
        console.error('Failed to clear seeding state:', error);
    }
}

/**
 * Check if there's a valid seeding state to resume
 * @returns {boolean} True if there's a valid state, false otherwise
 */
function hasSeedingState() {
    const state = loadSeedingState();
    if (!state) return false;
    
    // Check if the state is recent enough (within last 24 hours)
    try {
        const lastUpdateStr = localStorage.getItem(LAST_UPDATE_KEY);
        if (lastUpdateStr) {
            const lastUpdate = new Date(lastUpdateStr).getTime();
            const now = new Date().getTime();
            const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
            
            // If the state is too old, clear it and return false
            if (hoursDiff > 24) {
                clearSeedingState();
                return false;
            }
        }
    } catch (error) {
        console.error('Error checking seeding state age:', error);
    }
    
    return true;
}

// Export functions to make them available in the browser console for testing
window.seedingPersistence = {
    save: saveSeedingState,
    load: loadSeedingState,
    clear: clearSeedingState,
    hasState: hasSeedingState
};

// ========================
// Step 2: Capture Seeding State
// ========================

/**
 * Initialize seeding persistence by adding event listeners
 * This sets up all the mechanisms to save state and restore on page load
 */
function initSeedingPersistence() {
    console.log('Initializing seeding persistence');
    
    // Add beforeunload event listener to save state when user leaves or refreshes
    window.addEventListener('beforeunload', function(event) {
        console.log('Page unloading - saving seeding state');
        saveSeedingState();
    });
    
    // Set up periodic state saving (every 30 seconds)
    window.seedingStateSaveInterval = setInterval(function() {
        console.log('Periodic save of seeding state');
        saveSeedingState();
    }, 30000);
    
    // Add listeners to existing torrent events (without modifying them)
    document.addEventListener('torrentStateChanged', function(e) {
        console.log('Torrent state changed - saving state');
        saveSeedingState();
    });
    
    // Save state when pause/resume button is clicked
    const continueButton = document.getElementById('btn-continue-seeding');
    if (continueButton) {
        continueButton.addEventListener('click', function() {
            // This is an additional listener that doesn't modify the existing functionality
            setTimeout(function() {
                console.log('Pause/Resume clicked - saving seeding state');
                saveSeedingState();
            }, 100); // Small delay to ensure the state has been updated
        });
    }
    
    // We'll create a MutationObserver to watch for changes to the earning-rate element
    // This way we can save state when points change without modifying the existing code
    const earningRateElement = document.getElementById('earning-rate');
    if (earningRateElement) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                    console.log('Earning rate changed - saving seeding state');
                    saveSeedingState();
      }
    });
  });
  
        observer.observe(earningRateElement, { 
            characterData: true, 
            childList: true,
            subtree: true 
        });
    }
    
    // Execute the check for existing seeding state to restore
    checkForExistingSeedingState();
}

/**
 * Check if there's an existing seeding state to restore on page load
 */
function checkForExistingSeedingState() {
    // Only check if we have a valid state
    if (hasSeedingState()) {
        const state = loadSeedingState();
        console.log('Found existing seeding state:', state);
        
        // Create a custom event to notify the page that we have a seeding state to restore
        const event = new CustomEvent('seedingStateAvailable', { detail: state });
        document.dispatchEvent(event);
        
        // Add a restore banner to the page
        showRestoreBanner(state);
        } else {
        console.log('No valid seeding state found to restore');
    }
}

/**
 * Show a banner offering to restore previous seeding session
 */
function showRestoreBanner(state) {
    // Check if banner already exists
    if (document.getElementById('seeding-restore-banner')) return;
    
    // Create the restore banner
    const banner = document.createElement('div');
    banner.id = 'seeding-restore-banner';
    banner.style.position = 'fixed';
    banner.style.top = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.backgroundColor = 'rgba(0, 150, 136, 0.9)';
    banner.style.color = 'white';
    banner.style.padding = '10px';
    banner.style.textAlign = 'center';
    banner.style.zIndex = '10000';
    banner.style.display = 'flex';
    banner.style.justifyContent = 'center';
    banner.style.alignItems = 'center';
    
    // Format the content
    const formattedTokens = Math.round(state.totalTokensEarned);
    banner.innerHTML = `
        <div style="flex: 1;">Previous seeding session found (${formattedTokens} tokens earned). Would you like to resume?</div>
        <button id="restore-seeding-btn" style="background: white; color: #009688; border: none; padding: 5px 15px; margin: 0 10px; border-radius: 4px; cursor: pointer;">Resume Seeding</button>
        <button id="discard-seeding-btn" style="background: transparent; color: white; border: 1px solid white; padding: 5px 15px; margin: 0 10px; border-radius: 4px; cursor: pointer;">Discard</button>
    `;
    
    // Add the banner to the page
    document.body.appendChild(banner);
    
    // Add event listeners for the buttons
    document.getElementById('restore-seeding-btn').addEventListener('click', function() {
        console.log('User chose to restore seeding session');
        restoreSeedingSession(state);
        banner.remove();
    });
    
    document.getElementById('discard-seeding-btn').addEventListener('click', function() {
        console.log('User chose to discard seeding session');
        clearSeedingState();
        banner.remove();
    });
}

/**
 * Restore a saved seeding session
 * This function uses the UI buttons (rather than direct WebTorrent API calls)
 * to start the seeding process using the existing infrastructure
 */
function restoreSeedingSession(state) {
    console.log('Restoring seeding session from saved state:', state);
    
    // We'll use the existing UI buttons to trigger the seeding
    // This avoids modifying any WebTorrent code
    const seedOnlyButton = document.querySelector('.btn-download');
    if (seedOnlyButton) {
        console.log('Clicking Seed Only button to start seeding');
        seedOnlyButton.click();
        
        // Wait for the torrent to be added and then restore the tokens earned
        const checkInterval = setInterval(function() {
            if (window.currentTorrent && window.currentTorrent.infoHash) {
                clearInterval(checkInterval);
                
                // Restore the tokens earned
                if (state.totalTokensEarned > 0) {
                    console.log('Restoring total tokens earned:', state.totalTokensEarned);
                    window.totalTokensEarned = state.totalTokensEarned;
                    
                    // Update the UI to show the restored tokens
                    const earningRateElement = document.getElementById('earning-rate');
                    if (earningRateElement) {
                        earningRateElement.textContent = Math.round(state.totalTokensEarned);
                    }
                }
                
                // If the state was paused, also click the pause button
                if (state.paused) {
                    console.log('Previous state was paused, pausing seeding');
                    
                    // Wait for the continue button to be enabled
                    const pauseCheckInterval = setInterval(function() {
                        const continueButton = document.getElementById('btn-continue-seeding');
                        if (continueButton && !continueButton.disabled) {
                            clearInterval(pauseCheckInterval);
                            continueButton.click();
                        }
                    }, 1000);
                }
            }
        }, 1000);
    } else {
        console.log('Seed Only button not found, cannot restore session');
    }
}

// Update the restoreSeedingSession function to use TorrentStats for showing the status section
const existingRestoreSeedingSession = restoreSeedingSession;
restoreSeedingSession = function(state) {
    // Call the original function
    existingRestoreSeedingSession(state);
    
    // After a short delay, use TorrentStats to show the status section if available
    setTimeout(function() {
        if (window.TorrentStats && typeof window.TorrentStats.forceShowSeedingUI === 'function') {
            window.TorrentStats.forceShowSeedingUI();
        }
    }, 2000);
};

// Call this after the DOM has loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the persistence system
    setTimeout(initSeedingPersistence, 1000); // Add slight delay to ensure all elements are loaded
});

// ========================
// Step 3: Resume Logic on Page Load
// ========================

/**
 * Handle the case when a user chooses auto-resume
 * This avoids showing the banner and automatically resumes seeding
 */
function autoResumeSeedingSession() {
    if (hasSeedingState()) {
        const state = loadSeedingState();
        console.log('Auto-resuming seeding session:', state);
        
        // Add a small notification instead of the full banner
        showAutoResumeNotification(state);
        
        // Start the restoration process
        restoreSeedingSession(state);
        return true;
    }
    return false;
}

/**
 * Show a temporary notification that seeding was auto-resumed
 */
function showAutoResumeNotification(state) {
    const notification = document.createElement('div');
    notification.id = 'auto-resume-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'rgba(0, 150, 136, 0.9)';
    notification.style.color = 'white';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.transition = 'opacity 0.5s ease-in-out';
    
    // Format the content
    const formattedTokens = Math.round(state.totalTokensEarned);
    notification.innerHTML = `
        <div style="display: flex; align-items: center;">
            <i class="fas fa-seedling" style="margin-right: 10px;"></i>
            <div>Seeding automatically resumed (${formattedTokens} tokens)</div>
            <button id="dismiss-notification" style="background: transparent; border: none; color: white; margin-left: 10px; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to the page
    document.body.appendChild(notification);
    
    // Auto-dismiss after 5 seconds
    setTimeout(function() {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }
    }, 5000);
    
    // Add dismiss button functionality
    document.getElementById('dismiss-notification').addEventListener('click', function() {
        notification.remove();
    });
}

/**
 * Add auto-resume preference toggle to allow users to control behavior
 */
function addAutoResumeToggle() {
    // Check if the preference section already exists
    let preferencesSection = document.getElementById('seeding-preferences');
    
    // If not, create it
    if (!preferencesSection) {
        preferencesSection = document.createElement('div');
        preferencesSection.id = 'seeding-preferences';
        preferencesSection.style.margin = '20px 0';
        preferencesSection.style.padding = '15px';
        preferencesSection.style.backgroundColor = '#f5f5f5';
        preferencesSection.style.borderRadius = '4px';
        
        // Add a header
        const header = document.createElement('h3');
        header.textContent = 'Seeding Preferences';
        header.style.margin = '0 0 10px 0';
        header.style.fontSize = '16px';
        header.style.fontWeight = 'bold';
        preferencesSection.appendChild(header);
        
        // Find a good location to insert it
        const infoSection = document.querySelector('.info-section');
        if (infoSection) {
            infoSection.parentNode.insertBefore(preferencesSection, infoSection.nextSibling);
  } else {
            // Fallback to appending to the content container
            const contentContainer = document.querySelector('.content-container');
            if (contentContainer) {
                contentContainer.appendChild(preferencesSection);
            }
        }
    }
    
    // Create the auto-resume toggle
    const toggleContainer = document.createElement('div');
    toggleContainer.style.display = 'flex';
    toggleContainer.style.alignItems = 'center';
    toggleContainer.style.justifyContent = 'space-between';
    toggleContainer.style.marginBottom = '10px';
    
    const toggleLabel = document.createElement('label');
    toggleLabel.textContent = 'Auto-resume seeding when page loads';
    toggleLabel.style.flex = '1';
    
    const toggleSwitch = document.createElement('div');
    toggleSwitch.className = 'toggle-switch';
    toggleSwitch.style.position = 'relative';
    toggleSwitch.style.display = 'inline-block';
    toggleSwitch.style.width = '50px';
    toggleSwitch.style.height = '24px';
    
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = 'auto-resume-toggle';
    toggleInput.style.opacity = '0';
    toggleInput.style.width = '0';
    toggleInput.style.height = '0';
    // Set the initial state based on localStorage
    toggleInput.checked = localStorage.getItem('auto_resume_seeding') === 'true';
    
    const toggleSlider = document.createElement('span');
    toggleSlider.className = 'toggle-slider';
    toggleSlider.style.position = 'absolute';
    toggleSlider.style.cursor = 'pointer';
    toggleSlider.style.top = '0';
    toggleSlider.style.left = '0';
    toggleSlider.style.right = '0';
    toggleSlider.style.bottom = '0';
    toggleSlider.style.backgroundColor = toggleInput.checked ? '#009688' : '#ccc';
    toggleSlider.style.transition = '.4s';
    toggleSlider.style.borderRadius = '24px';
    
    // Create the circle
    const toggleCircle = document.createElement('span');
    toggleCircle.style.position = 'absolute';
    toggleCircle.style.content = '""';
    toggleCircle.style.height = '16px';
    toggleCircle.style.width = '16px';
    toggleCircle.style.left = toggleInput.checked ? '30px' : '4px';
    toggleCircle.style.bottom = '4px';
    toggleCircle.style.backgroundColor = 'white';
    toggleCircle.style.transition = '.4s';
    toggleCircle.style.borderRadius = '50%';
    
    toggleSwitch.appendChild(toggleInput);
    toggleSwitch.appendChild(toggleSlider);
    toggleSlider.appendChild(toggleCircle);
    
    toggleContainer.appendChild(toggleLabel);
    toggleContainer.appendChild(toggleSwitch);
    
    preferencesSection.appendChild(toggleContainer);
    
    // Add event listener for the toggle
    toggleInput.addEventListener('change', function() {
        const isChecked = this.checked;
        localStorage.setItem('auto_resume_seeding', isChecked);
        console.log('Auto-resume preference updated:', isChecked);
        
        // Update the toggle appearance
        toggleSlider.style.backgroundColor = isChecked ? '#009688' : '#ccc';
        toggleCircle.style.left = isChecked ? '30px' : '4px';
    });
    
    // Add help text below
    const helpText = document.createElement('p');
    helpText.style.fontSize = '12px';
    helpText.style.color = '#666';
    helpText.style.margin = '5px 0 0 0';
    helpText.textContent = 'When enabled, seeding will automatically resume when you return to this page.';
    toggleContainer.appendChild(helpText);
}

/**
 * Update the checkForExistingSeedingState function to respect auto-resume preference
 */
const originalCheckForExistingSeedingState = checkForExistingSeedingState;
checkForExistingSeedingState = function() {
    // Only check if we have a valid state
    if (hasSeedingState()) {
        const state = loadSeedingState();
        console.log('Found existing seeding state:', state);
        
        // Default to auto-resume unless explicitly disabled
        // This changes the default behavior to auto-resume
        if (localStorage.getItem('auto_resume_seeding') !== 'false') {
            console.log('Auto-resuming by default');
            autoResumeSeedingSession();
    } else {
            // Only show banner if auto-resume is explicitly disabled
            console.log('Auto-resume disabled, showing banner');
            const event = new CustomEvent('seedingStateAvailable', { detail: state });
            document.dispatchEvent(event);
            showRestoreBanner(state);
    }
  } else {
        console.log('No valid seeding state found to restore');
    }
};

// Update initialization to add the toggle
const originalInitSeedingPersistence = initSeedingPersistence;
initSeedingPersistence = function() {
    // Call the original function
    originalInitSeedingPersistence();
    
    // Add the auto-resume toggle
    setTimeout(function() {
        addAutoResumeToggle();
    }, 2000); // Give the page some time to load first
};

// ========================
// Step 4: Handle Page Navigation/Refresh Events
// ========================

/**
 * Enhanced page navigation event handling
 * Captures more events and improves reliability of state saving when leaving page
 */
function setupEnhancedNavigationHandling() {
    console.log('Setting up enhanced navigation event handling');
    
    // Store the original beforeunload handler to avoid duplicating logic
    const originalBeforeUnloadHandler = window.onbeforeunload;
    
    // Enhanced beforeunload handler with prioritized state saving
    window.onbeforeunload = function(event) {
        console.log('Enhanced beforeunload triggered - saving state with high priority');
        
        // Force immediate state saving
        try {
            // Only save if we have an active torrent and aren't in the middle of starting up
            if (window.client && 
                window.client.torrents && 
                window.client.torrents.length > 0 &&
                window.currentTorrent) {
                
                // Create a special flag indicating this was saved during page unload
                // This can be used to prioritize restoration on next load
                const currentTorrent = window.client.torrents[0];
                
                // Create state object with all necessary information to resume seeding
                const seedingState = {
                    infoHash: currentTorrent.infoHash,
                    magnetURI: currentTorrent.magnetURI,
                    downloaded: currentTorrent.downloaded,
                    uploaded: currentTorrent.uploaded,
                    progress: currentTorrent.progress,
                    paused: window.isSeedingPaused === true,
                    totalTokensEarned: window.totalTokensEarned || 0,
                    title: currentTorrent.name || 'Unknown',
                    lastActiveTime: new Date().toISOString(),
                    contentId: currentTorrent.infoHash || 'sample-video-1',
                    exitVia: 'pageUnload', // Special marker for unload events
                    wasSeeding: true
                };
                
                // Use synchronous localStorage to ensure it completes
                try {
                    localStorage.setItem(SEEDING_STATE_KEY, JSON.stringify(seedingState));
                    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
                    console.log('Successfully saved state during page unload');
                } catch (error) {
                    console.error('Failed to save state during page unload:', error);
                }
            }
        } catch (error) {
            console.error('Error in enhanced beforeunload handler:', error);
        }
        
        // Call the original handler if it existed
        if (typeof originalBeforeUnloadHandler === 'function') {
            return originalBeforeUnloadHandler(event);
        }
    };
    
    // Track visibility changes to handle tab switching
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            console.log('Page visibility changed to hidden - saving state');
            saveSeedingState();
        } else if (document.visibilityState === 'visible') {
            console.log('Page visibility changed to visible - checking for state changes');
            // When returning to the tab, check if we need to update our state
            checkForStateUpdatesFromOtherTabs();
        }
    });
    
    // Handle page show/hide events (especially useful for mobile)
    window.addEventListener('pagehide', function() {
        console.log('Page hide event - saving state');
        saveSeedingState();
    });
    
    window.addEventListener('pageshow', function(event) {
        console.log('Page show event, persisted:', event.persisted);
        // If the page was loaded from the back-forward cache
        if (event.persisted) {
            console.log('Page restored from back-forward cache - checking state');
            checkForStateUpdatesFromOtherTabs();
        }
    });
    
    // Use the browser's Navigation API when available (modern browsers)
    if ('navigation' in window) {
        window.navigation.addEventListener('navigate', function(event) {
            console.log('Navigation event detected, type:', event.type);
            saveSeedingState();
        });
    }
    
    // Track network changes to save state when going offline
    window.addEventListener('offline', function() {
        console.log('Network went offline - saving current state');
        saveSeedingState();
    });
}

/**
 * Check if there are newer state updates from other tabs or sessions
 */
function checkForStateUpdatesFromOtherTabs() {
    try {
        // We'll use the timestamp to check if the state was updated elsewhere
        const lastUpdateStr = localStorage.getItem(LAST_UPDATE_KEY);
        if (!lastUpdateStr) return;
        
        const lastUpdate = new Date(lastUpdateStr).getTime();
        const currentSaveTime = window.lastStateSaveTime || 0;
        
        // If the saved state is newer than our last save, we should check it
        if (lastUpdate > currentSaveTime) {
            console.log('Detected newer state from another tab/session');
            
            const state = loadSeedingState();
            // Only consider refreshing if we're not actively seeding or have a different torrent
            if (!window.currentTorrent || 
                (state && state.infoHash !== window.currentTorrent.infoHash)) {
                
                // Show a notification about the updated state
                showStateUpdateNotification(state);
            }
        }
    } catch (error) {
        console.error('Error checking for state updates:', error);
    }
}

/**
 * Show notification about state updates from other tabs
 */
function showStateUpdateNotification(state) {
    if (!state) return;
    
    const notification = document.createElement('div');
    notification.id = 'state-update-notification';
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = 'rgba(33, 33, 33, 0.85)';
    notification.style.color = 'white';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.maxWidth = '300px';
    
    const formattedTokens = Math.round(state.totalTokensEarned);
    const lastActive = new Date(state.lastActiveTime);
    const timeAgo = formatTimeAgo(lastActive);
    
    notification.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold;">Seeding Updated</div>
        <div style="margin-bottom: 5px; font-size: 14px;">Another session was seeding "${state.title}" (${formattedTokens} tokens earned).</div>
        <div style="font-size: 12px; opacity: 0.8;">Last active: ${timeAgo}</div>
        <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <button id="dismiss-update-notification" style="background: transparent; border: 1px solid #ccc; color: white; padding: 5px 10px; border-radius: 4px; margin-right: 10px; cursor: pointer;">Dismiss</button>
            <button id="sync-update-notification" style="background: #009688; border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Sync</button>
    </div>
  `;
  
    document.body.appendChild(notification);
    
    // Add event listeners
    document.getElementById('dismiss-update-notification').addEventListener('click', function() {
        notification.remove();
    });
    
    document.getElementById('sync-update-notification').addEventListener('click', function() {
        // If we're already seeding, ask for confirmation before switching
        if (window.currentTorrent) {
            if (!confirm('You are currently seeding another file. Switch to the updated torrent?')) {
                notification.remove();
                return;
            }
        }
        
        restoreSeedingSession(state);
        notification.remove();
    });
    
    // Auto-dismiss after 15 seconds
    setTimeout(function() {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 15000);
}

/**
 * Track when the state was last saved in this session
 * This helps detect changes from other tabs/sessions
 */
const originalSaveSeedingState = saveSeedingState;
saveSeedingState = function() {
    originalSaveSeedingState();
    window.lastStateSaveTime = new Date().getTime();
};

// Update initialization to add enhanced navigation handling
const enhancedInitSeedingPersistence = initSeedingPersistence;
initSeedingPersistence = function() {
    // Call the previously enhanced function
    enhancedInitSeedingPersistence();
    
    // Add enhanced navigation handling
    setupEnhancedNavigationHandling();
};

// ========================
// Step 5: Update UI to Reflect Persistence
// ========================

/**
 * Add a persistent seeding indicator to the UI
 * This shows users that seeding will continue even if they leave the page
 */
function addPersistentSeedingIndicator() {
    // Don't add if it already exists
    if (document.getElementById('persistent-seeding-indicator')) {
        return;
    }
    
    console.log('Adding persistent seeding indicator');
    
    // Create the indicator element
    const indicator = document.createElement('div');
    indicator.id = 'persistent-seeding-indicator';
    indicator.style.display = 'flex';
    indicator.style.alignItems = 'center';
    indicator.style.position = 'absolute';
    indicator.style.right = '20px';
    indicator.style.top = '20px';
    indicator.style.backgroundColor = 'rgba(0,255,0,0.2)';
    indicator.style.color = '#4CAF50';
    indicator.style.padding = '5px 10px';
    indicator.style.borderRadius = '20px';
    indicator.style.fontSize = '0.8rem';
    indicator.style.fontWeight = 'bold';
    indicator.style.zIndex = '100';
    indicator.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    indicator.style.transition = 'all 0.3s ease';
    indicator.style.opacity = '1';
    
    // Add content to the indicator
    indicator.innerHTML = '<i class="fas fa-arrow-up" style="margin-right: 5px;"></i> Seeding';
    
    // Add it to the header
    const header = document.querySelector('.watch-header');
    if (header) {
        header.appendChild(indicator);
    } else {
        // Fallback to appending to the body
        document.body.appendChild(indicator);
    }
    
    // Make sure the indicator doesn't interfere with the back button
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.style.zIndex = '101';
    }
    
    return indicator;
}

// Update the persistent seeding indicator - call this when seeding status changes
function updatePersistentSeedingIndicator(isSeeding) {
    const indicator = document.getElementById('persistent-seeding-indicator');
    
    if (!indicator) {
        // Add the indicator if it doesn't exist
        if (isSeeding) {
            addPersistentSeedingIndicator();
        }
        return;
    }
    
    if (isSeeding) {
        indicator.style.display = 'flex';
        indicator.style.opacity = '1';
    } else {
        indicator.style.opacity = '0';
        
        // After fade-out animation, hide the element
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 300);
    }
}

// Check seeding status periodically and update UI accordingly
setInterval(function() {
    if (window.client && window.client.torrents && window.client.torrents.length > 0) {
        const torrent = window.client.torrents[0];
        
        // Consider active seeding if upload speed > 0 or if we're completely downloaded
        const isActivelySeeding = torrent.uploadSpeed > 0 || torrent.progress === 1;
        
        // Add indicator if we're seeding
        if (isActivelySeeding && !window.isSeedingPaused) {
            if (!document.getElementById('persistent-seeding-indicator')) {
                addPersistentSeedingIndicator();
            } else {
                updatePersistentSeedingIndicator(true);
            }
        }
        
        // Update torrent stats display
        if (torrent.uploadSpeed > 0) {
            // Update tokens earned
            const uploadSpeedMBps = torrent.uploadSpeed / (1024 * 1024);
            const earningRateElement = document.getElementById('earning-rate');
            
            // Make sure token display is visible
            if (document.getElementById('torrent-info')) {
                document.getElementById('torrent-info').style.display = 'block';
            }
            
            // Update reward badge amount if it exists
            if (earningRateElement) {
                const currentTokens = parseFloat(earningRateElement.textContent) || 0;
                const pointsPerMB = 0.1; // Rate of points per MB uploaded
                const newPoints = uploadSpeedMBps * pointsPerMB;
                
                // Accumulate total tokens
                window.totalTokensEarned = (window.totalTokensEarned || 0) + newPoints;
                
                // Update display
                earningRateElement.textContent = Math.round(window.totalTokensEarned);
            }
        }
    }
}, 1000); // Update every 1 second

/**
 * Force show the seeding indicator and status section when torrent is active
 * This functionality has been moved to torrent-stats.js
 */
function forceShowSeedingUI() {
    // This function has been moved to torrent-stats.js
    console.log('forceShowSeedingUI called from watch.js - this function has been moved to torrent-stats.js');
    if (window.TorrentStats && typeof window.TorrentStats.forceShowSeedingUI === 'function') {
        window.TorrentStats.forceShowSeedingUI();
    }
}

// Setup watchers to detect when torrent actually becomes active
document.addEventListener('DOMContentLoaded', function() {
    // Watch for the torrent-info element to become visible
    const torrentInfo = document.getElementById('torrent-info');
    if (torrentInfo) {
        // Create observer
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'style' &&
                    torrentInfo.style.display !== 'none') {
                    
                    console.log('Torrent info became visible, checking for active torrent');
                    
                    // Check at intervals to detect when torrent becomes active
                    const checkInterval = setInterval(function() {
                        if (window.currentTorrent) {
                            clearInterval(checkInterval);
                            console.log('Active torrent detected, showing UI');
                            forceShowSeedingUI();
                        }
                    }, 1000);
                }
            });
        });
        
        // Start observing
        observer.observe(torrentInfo, { attributes: true });
        
        // Also check immediately in case it's already visible
        if (torrentInfo.style.display !== 'none' && window.currentTorrent) {
            forceShowSeedingUI();
        }
    }
    
    // Also check for download complete event which should trigger the UI
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const progressObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'style' &&
                    progressBar.style.width === '100%') {
                    
                    console.log('Download complete detected via progress bar');
                    setTimeout(forceShowSeedingUI, 1000);
                }
            });
        });
        
        // Start observing
        progressObserver.observe(progressBar, { attributes: true });
    }
});

// Make auto-resume the default behavior by changing the original implementation
// This ensures users don't need to manually resume seeding after refresh
const autoResumeDefault = autoResumeSeedingSession;
autoResumeSeedingSession = function() {
    // Set auto-resume to true by default if not explicitly set
    if (localStorage.getItem('auto_resume_seeding') === null) {
        localStorage.setItem('auto_resume_seeding', 'true');
    }
    
    // Call the original implementation
    return autoResumeDefault.apply(this, arguments);
};

// Add a function to update the seeding duration display has been moved to torrent-stats.js

// Fix the progress bar styling in the torrent.on('done') handlers has been moved to torrent-stats.js

// Function to show the seeding UI even if we're not actually seeding
function forceShowSeedingUI() {
    console.log('Forcing the seeding UI to show for demo purposes');
    // ... existing code ...
}

/**
 * Show a temporary message to the user
 * This functionality has been moved to torrent-stats.js
 */
function showTemporaryMessage(message, type = 'success') {
    // This function has been moved to torrent-stats.js
    console.log('showTemporaryMessage called from watch.js - this function has been moved to torrent-stats.js');
    if (window.TorrentStats && typeof window.TorrentStats.showTemporaryMessage === 'function') {
        window.TorrentStats.showTemporaryMessage(message, type);
    }
}

/**
 * Start periodic updates of the seeding status section
 * This functionality has been moved to torrent-stats.js
 */
function startSeedingStatusUpdates() {
    // This function has been moved to torrent-stats.js
    console.log('startSeedingStatusUpdates called from watch.js - this function has been moved to torrent-stats.js');
    if (window.TorrentStats && typeof window.TorrentStats.startSeedingStatusUpdates === 'function') {
        window.TorrentStats.startSeedingStatusUpdates();
    }
}

/**
 * Update the seeding status information in the UI
 * This functionality has been moved to torrent-stats.js
 */
function updateSeedingStatusInfo() {
    // This function has been moved to torrent-stats.js
    console.log('updateSeedingStatusInfo called from watch.js - this function has been moved to torrent-stats.js');
    if (window.TorrentStats && typeof window.TorrentStats.updateSeedingStatusInfo === 'function') {
        window.TorrentStats.updateSeedingStatusInfo();
    }
}

/**
 * Format a duration in milliseconds to HH:MM:SS
 * This functionality has been moved to torrent-stats.js
 */
function formatDuration(durationMs) {
    // This function has been moved to torrent-stats.js
    console.log('formatDuration called from watch.js - this function has been moved to torrent-stats.js');
    if (window.TorrentStats && typeof window.TorrentStats.formatDuration === 'function') {
        return window.TorrentStats.formatDuration(durationMs);
    }
    return "0m"; // Default fallback
}

/**
 * Stop seeding and clear state
 * This functionality has been moved to torrent-stats.js
 */
function stopSeedingAndClearState() {
    // This function has been moved to torrent-stats.js
    console.log('stopSeedingAndClearState called from watch.js - this function has been moved to torrent-stats.js');
    if (window.TorrentStats && typeof window.TorrentStats.stopSeedingAndClearState === 'function') {
        window.TorrentStats.stopSeedingAndClearState();
    } else {
        // Fallback to ensure we at least clear the state
        clearSeedingState();
    }
}

// This observer functionality has been moved to torrent-stats.js
document.addEventListener('DOMContentLoaded', function() {
    // Let torrent-stats.js handle the UI elements now
    console.log('DOMContentLoaded event in watch.js - UI elements handled by torrent-stats.js');
});

// Update initialization to use TorrentStats for UI elements
const uiEnhancedInitSeedingPersistence = initSeedingPersistence;
initSeedingPersistence = function() {
    // Call the previously enhanced function
    uiEnhancedInitSeedingPersistence();
    
    // Let TorrentStats handle the UI elements
    console.log('Enhanced initSeedingPersistence - UI elements handled by torrent-stats.js');
    if (window.TorrentStats) {
        if (typeof window.TorrentStats.addPersistentSeedingIndicator === 'function') {
            window.TorrentStats.addPersistentSeedingIndicator();
        }
        if (typeof window.TorrentStats.addSeedingStatusSection === 'function') {
            window.TorrentStats.addSeedingStatusSection();
        }
    }
};

// Function to handle torrent download completion and enable the Pause Seeding button
function handleTorrentDone(torrent) {
    console.log('Download completed, enabling Pause Seeding button');
    
    // Enable the Pause Seeding button
    const continueButton = document.getElementById('btn-continue-seeding');
    if (continueButton) {
        continueButton.disabled = false;
        console.log('Pause Seeding button enabled');
    }
    
    // Make sure torrent is available globally
    window.currentTorrent = torrent;
    
    // Set up metrics reporting if not already running
    if (!window.metricsInterval) {
        window.metricsInterval = setInterval(() => {
            if (!window.isSeedingPaused && !window.isReportingMetrics) {
                if (window.TorrentStats && typeof window.TorrentStats.reportMetrics === 'function') {
                    window.TorrentStats.reportMetrics(torrent.uploadSpeed, torrent.numPeers);
                } else if (typeof window.reportMetrics === 'function') {
                    window.reportMetrics(torrent.uploadSpeed, torrent.numPeers);
                }
            }
        }, 2000);
    }
    
    // Set up direct points system update interval
    if (!window.directMetricsInterval) {
        window.directMetricsInterval = setInterval(() => {
            if (!window.isSeedingPaused) {
                if (window.TorrentStats && typeof window.TorrentStats.updateMetricsDisplay === 'function') {
                    window.TorrentStats.updateMetricsDisplay();
                } else {
                    // Simple fallback points calculation
                    if (typeof window.totalTokensEarned === 'undefined') {
                        window.totalTokensEarned = 0;
                    }
                    window.totalTokensEarned += 1; // 1 point per second
                    
                    // Update UI
                    const earningRate = document.getElementById('earning-rate');
                    if (earningRate) {
                        earningRate.textContent = Math.round(window.totalTokensEarned);
                    }
                }
            }
        }, 1000);
    }
    
    // Make sure UI updates work
    if (!window.earningRateInterval) {
        window.earningRateInterval = setInterval(() => {
            if (window.totalTokensEarned > 0) {
                const earningRate = document.getElementById('earning-rate');
                if (earningRate) {
                    earningRate.textContent = Math.round(window.totalTokensEarned);
                }
            }
        }, 500);
    }
    
    // Update UI to show download is complete
    updateDownloadCompleteUI();
}

// Helper function to update UI when download completes
function updateDownloadCompleteUI() {
    // Force the progress bar to be green
    if (window.TorrentStats && typeof window.TorrentStats.forceGreenProgressBar === 'function') {
        window.TorrentStats.forceGreenProgressBar();
    }
    
    // Update summary progress to 100%
    const summaryProgress = document.getElementById('torrent-progress-summary');
    if (summaryProgress) {
        summaryProgress.textContent = '100%';
    }
    
    // Set up seeding duration tracking
    if (!window.seedingStartTime) {
        window.seedingStartTime = Date.now();
    }
    
    // Update progress label for seeding mode
    const progressLabel = document.querySelector('.progress-label');
    if (progressLabel) {
        progressLabel.textContent = 'Seeding Time: 0m | Total Upload: 0 B';
        
        // Start periodic updates of seeding duration if not already started
        if (!window.seedingDurationInterval) {
            window.seedingDurationInterval = setInterval(function() {
                if (window.TorrentStats && typeof window.TorrentStats.updateSeedingDuration === 'function') {
                    window.TorrentStats.updateSeedingDuration();
                }
            }, 1000);
        }
    }
    
    // Ensure seeding indicators are visible
    addPersistentSeedingIndicator();
    setTimeout(function() {
        const indicator = document.getElementById('persistent-seeding-indicator');
        if (indicator) {
            indicator.style.display = 'flex';
            indicator.style.opacity = '1';
        }
        forceShowSeedingUI();
    }, 500);
    
    // Update UI for seed-only mode
    updateSeedOnlyUI();
}

// Fix for points not updating properly
document.addEventListener('DOMContentLoaded', function() {
    // Primary metrics reporter - uses server API
    setInterval(function() {
        const earningRateElement = document.getElementById('earning-rate');
        
        // Check if we're actually seeding (have an active torrent with upload)
        if (window.client && window.client.torrents && window.client.torrents.length > 0) {
            const torrent = window.client.torrents[0];
            // Only trigger reportMetrics if actually uploading data
            if (torrent && torrent.uploadSpeed > 0 && !window.isReportingMetrics) {
                // Call the reportMetrics function if available
                if (typeof window.reportMetrics === 'function') {
                    window.reportMetrics(torrent.uploadSpeed, torrent.numPeers);
                } else if (window.TorrentStats && typeof window.TorrentStats.reportMetrics === 'function') {
                    window.TorrentStats.reportMetrics(torrent.uploadSpeed, torrent.numPeers);
                }
            }
        }
    }, 2000);
    
    // Fallback if the server API fails or isn't available
    setInterval(function() {
        // Only run if no metrics are currently being reported and we have an active torrent
        if (window.client && 
            window.client.torrents && 
            window.client.torrents.length > 0) {
            
            const torrent = window.client.torrents[0];
            // Only update if actually uploading data and not already reporting metrics
            if (torrent && torrent.uploadSpeed > 0 && !window.isSeedingPaused) {
                // Calculate points locally - 1 point per second regardless of upload speed
                const secondsElapsed = 3; // This interval runs every 3 seconds
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
                
                console.log(`Local points update from watch.js: +${newPoints} points, Total: ${window.totalTokensEarned}`);
            }
        }
    }, 3000); // Every 3 seconds as a fallback/emergency update
});

// The forceGreenProgressBar function is already defined in torrent-stats.js
// and called through window.TorrentStats.forceGreenProgressBar()
