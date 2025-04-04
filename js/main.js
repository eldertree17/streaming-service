// API Service
class ApiService {
    constructor() {
        // Use the config URL if available, otherwise fallback
        this.baseUrl = window.StreamFlixConfig?.API_URL || 'https://streamflix-backend.onrender.com/api';
        console.log('API Service initialized with base URL:', this.baseUrl);
    }

    async getMovies() {
        const response = await fetch(`${this.baseUrl}/content`);
        if (!response.ok) {
            // Try to get the sample video as fallback
            const sampleResponse = await fetch(`${this.baseUrl}/content/video`);
            if (!sampleResponse.ok) throw new Error('Failed to fetch content');
            return [await sampleResponse.json()];
        }
        return response.json();
    }

    async getMovie(id) {
        const response = await fetch(`${this.baseUrl}/content/${id}`);
        if (!response.ok) throw new Error('Failed to fetch movie');
        return response.json();
    }

    async searchMovies(query) {
        const response = await fetch(`${this.baseUrl}/content/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to search movies');
        return response.json();
    }

    async updateUserMetrics(userData) {
        const response = await fetch(`${this.baseUrl}/metrics/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Failed to update metrics');
        return response.json();
    }
}

// Content Manager
class ContentManager {
    constructor() {
        this.api = new ApiService();
        this.movies = [];
        this.categories = new Map();
        this.currentMovie = null;
    }

    async loadMovies() {
        try {
            this.movies = await this.api.getMovies();
            this.categorizeMovies();
            return this.movies;
        } catch (error) {
            console.error('Error loading movies:', error);
            throw error;
        }
    }

    categorizeMovies() {
        this.categories.clear();
        this.movies.forEach(movie => {
            movie.categories?.forEach(category => {
                if (!this.categories.has(category)) {
                    this.categories.set(category, []);
                }
                this.categories.get(category).push(movie);
            });
        });
    }

    async getMovieById(id) {
        try {
            this.currentMovie = await this.api.getMovie(id);
            return this.currentMovie;
        } catch (error) {
            console.error('Error loading movie:', error);
            throw error;
        }
    }

    async searchMovies(query) {
        try {
            return await this.api.searchMovies(query);
        } catch (error) {
            console.error('Error searching movies:', error);
            throw error;
        }
    }
}

// UI Manager
class UiManager {
    constructor(contentManager) {
        this.contentManager = contentManager;
    }

    createMovieCard(movie) {
        return `
            <div class="content-card" data-movie-id="${movie._id}">
                <img src="${movie.posterImage}" alt="${movie.title}">
                <div class="card-info">
                    <p>${movie.title}</p>
                    <div class="likes">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${movie.likes || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }

    createCategorySection(category, movies) {
        return `
            <div class="section">
                <div class="section-header">
                    <h3>${category}</h3>
                    <span class="see-all">See All</span>
                </div>
                <div class="content-row">
                    ${movies.map(movie => this.createMovieCard(movie)).join('')}
                </div>
            </div>
        `;
    }

    updateHomeContent() {
        const container = document.getElementById('category-container');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Add categories
        this.contentManager.categories.forEach((movies, category) => {
            container.innerHTML += this.createCategorySection(category, movies);
        });
    }

    updateWatchContent(movie) {
        const container = document.querySelector('.app-container');
        if (!container || !movie) return;

        container.innerHTML = `
            <div class="watch-container">
                <video id="video-player" controls>
                    <source src="${movie.videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-info">
                    <h2>${movie.title}</h2>
                    <p>${movie.description}</p>
                    <div class="video-actions">
                        <button class="like-btn">
                            <i class="fas fa-thumbs-up"></i>
                            <span>${movie.likes || 0}</span>
                        </button>
                        <button class="share-btn">
                            <i class="fas fa-share"></i>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Set up event listeners for the home page
    setupHomeEventListeners() {
        // Set up search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const searchField = document.querySelector('.search-field');
            
            // Make the entire search field clickable
            if (searchField) {
                searchField.addEventListener('click', function() {
                    if (window.telegramApp) {
                        window.telegramApp.navigateTo('/search');
                    } else {
                        window.location.href = "pages/search";
                    }
                });
            }
            
            // Make search input focus also redirect to search page
            searchInput.addEventListener('focus', function() {
                if (window.telegramApp) {
                    window.telegramApp.navigateTo('/search');
                } else {
                    window.location.href = "pages/search";
                }
            });
            
            // Handle input clicks
            searchInput.addEventListener('click', function() {
                if (window.telegramApp) {
                    window.telegramApp.navigateTo('/search');
                } else {
                    window.location.href = "pages/search";
                }
            });
            
            // Handle enter key
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (window.telegramApp) {
                        window.telegramApp.navigateTo('/search', { query });
                    } else {
                        window.location.href = `pages/search?query=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
        
        // Set up voice search
        const voiceIcon = document.querySelector('.fa-microphone');
        if (voiceIcon) {
            voiceIcon.addEventListener('click', function(e) {
                e.stopPropagation(); // Stop propagation to prevent double redirect
                alert("Voice search feature coming soon!");
            });
        }
        
        // Set up hero card click
        const featuredMovie = document.getElementById('featured-movie');
        if (featuredMovie) {
            featuredMovie.addEventListener('click', function() {
                const id = '67d919a32437ccb3a8680549'; // Featured movie ID
                console.log('Navigating to featured movie page with ID:', id);
                if (window.telegramApp) {
                    window.telegramApp.navigateTo('/watch', { id });
                } else {
                    const baseUrl = window.location.origin;
                    window.location.href = `${baseUrl}/pages/watch.html?id=${id}`;
                }
            });
        }
        
        // Set up like button
        const featuredLike = document.getElementById('featured-like');
        if (featuredLike) {
            featuredLike.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
                const likeCount = this.querySelector('span');
                
                if (this.classList.contains('active')) {
                    likeCount.textContent = '1.6K';
                } else {
                    likeCount.textContent = '1.5K';
                }
            });
        }
        
        // Handle test video card click
        const testVideoCard = document.getElementById('test-video-card');
        if (testVideoCard) {
            testVideoCard.addEventListener('click', function() {
                console.log('Test video card clicked, navigating to sample-video-1');
                
                if (window.telegramApp) {
                    window.telegramApp.navigateTo('/watch', { id: 'sample-video-1' });
                } else {
                    const baseUrl = window.location.origin;
                    window.location.href = `${baseUrl}/pages/watch.html?id=sample-video-1`;
                }
                return false; // Stop event propagation
            });
            // Add pointer cursor for better UX
            testVideoCard.style.cursor = 'pointer';
        }
    }
    
    // Helper function to ensure each row has exactly 15 items
    ensureItemCount(items, count = 15) {
        if (items.length === 0) return [];
        if (items.length >= count) return items.slice(0, count);
        
        // If we have fewer items than needed, duplicate them until we reach the count
        const result = [...items];
        while (result.length < count) {
            // Add items from the beginning until we reach the desired count
            const needed = count - result.length;
            const itemsToAdd = items.slice(0, Math.min(needed, items.length));
            result.push(...itemsToAdd);
        }
        return result;
    }
    
    // Create a content card element
    createContentCardElement(item) {
        const div = document.createElement('div');
        div.className = 'content-card';
        
        // Use absolute path with window.location.origin
        const baseUrl = window.location.origin;
        
        div.innerHTML = `
            <a href="${baseUrl}/pages/watch.html?id=${item._id}">
                <img src="${item.posterImage}" alt="${item.title}">
                <div class="card-info">
                    <p>${item.title}</p>
                </div>
            </a>
        `;
        
        div.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default to manually handle navigation
            console.log('Navigating to watch page with ID:', item._id);
            
            if (window.telegramApp) {
                window.telegramApp.navigateTo('/watch', { id: item._id });
            } else {
                window.location.href = `${baseUrl}/pages/watch.html?id=${item._id}`;
            }
        });
        
        return div;
    }
    
    // Load and populate content rows
    async loadContentRows() {
        try {
            // Fetch content from API
            const content = await this.contentManager.loadMovies();
            
            if (content && content.length > 0) {
                // Clear loading indicators
                document.querySelectorAll('.loading-spinner').forEach(spinner => {
                    spinner.remove();
                });
                
                // Reference all row containers
                const rowContainers = {
                    newReleases: document.getElementById('new-releases-row'),
                    popularMovies: document.getElementById('popular-movies-row'),
                    classics: document.getElementById('classics-row'),
                    action: document.getElementById('action-row'),
                    scifi: document.getElementById('scifi-row'),
                    drama: document.getElementById('drama-row'),
                    comedy: document.getElementById('comedy-row'),
                    horror: document.getElementById('horror-row'),
                    documentary: document.getElementById('documentary-row'),
                    animation: document.getElementById('animation-row'),
                    family: document.getElementById('family-row'),
                    mystery: document.getElementById('mystery-row'),
                    thriller: document.getElementById('thriller-row'),
                    romance: document.getElementById('romance-row'),
                    western: document.getElementById('western-row')
                };
                
                // Sort content by date (newest first) for new releases
                if (rowContainers.newReleases) {
                    const sortedByDate = [...content].sort((a, b) => {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                    
                    // Populate new releases with exactly 15 items
                    const newReleases = this.ensureItemCount(sortedByDate);
                    newReleases.forEach(item => {
                        rowContainers.newReleases.appendChild(this.createContentCardElement(item));
                    });
                }
                
                // Populate popular movies (by likes)
                if (rowContainers.popularMovies) {
                    const sortedByLikes = [...content].sort((a, b) => {
                        return (b.likes || 0) - (a.likes || 0);
                    });
                    
                    const popularMovies = this.ensureItemCount(sortedByLikes);
                    popularMovies.forEach(item => {
                        rowContainers.popularMovies.appendChild(this.createContentCardElement(item));
                    });
                }
                
                // Filter for classics
                if (rowContainers.classics) {
                    const classicsContent = content.filter(item => 
                        (item.releaseYear && parseInt(item.releaseYear) < 1980) ||
                        (item.genre && item.genre.some(g => 
                            g.toLowerCase().includes('classic') || 
                            g.toLowerCase().includes('public domain')
                        ))
                    );
                    
                    const classics = this.ensureItemCount(classicsContent.length > 0 ? classicsContent : content);
                    classics.forEach(item => {
                        rowContainers.classics.appendChild(this.createContentCardElement(item));
                    });
                }
                
                // Helper function to populate genre rows
                const populateGenreRow = (rowElement, genreName) => {
                    if (!rowElement) return;
                    
                    const genreContent = content.filter(item => 
                        item.genre && item.genre.some(g => 
                            g.toLowerCase().includes(genreName.toLowerCase())
                        )
                    );
                    
                    const itemsToRender = this.ensureItemCount(genreContent.length > 0 ? genreContent : content);
                    itemsToRender.forEach(item => {
                        rowElement.appendChild(this.createContentCardElement(item));
                    });
                };
                
                // Populate genre-specific rows
                if (rowContainers.action) populateGenreRow(rowContainers.action, 'action');
                if (rowContainers.scifi) populateGenreRow(rowContainers.scifi, 'sci-fi');
                if (rowContainers.drama) populateGenreRow(rowContainers.drama, 'drama');
                if (rowContainers.comedy) populateGenreRow(rowContainers.comedy, 'comedy');
                if (rowContainers.horror) populateGenreRow(rowContainers.horror, 'horror');
                if (rowContainers.documentary) populateGenreRow(rowContainers.documentary, 'documentary');
                if (rowContainers.animation) populateGenreRow(rowContainers.animation, 'animation');
                if (rowContainers.family) populateGenreRow(rowContainers.family, 'family');
                if (rowContainers.mystery) populateGenreRow(rowContainers.mystery, 'mystery');
                if (rowContainers.thriller) populateGenreRow(rowContainers.thriller, 'thriller');
                if (rowContainers.romance) populateGenreRow(rowContainers.romance, 'romance');
                if (rowContainers.western) populateGenreRow(rowContainers.western, 'western');
            }
        } catch (error) {
            console.error('Error loading content:', error);
            document.querySelectorAll('.loading-spinner').forEach(spinner => {
                spinner.textContent = 'Error loading content. Please try again later.';
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Content Loaded - Initializing app...");
    console.log("Is Telegram Mini App?", !!window.Telegram?.WebApp || !!window.IS_TELEGRAM_MINI_APP);
    
    // Skip initialization if we're in a Telegram Mini App context
    if (window.Telegram?.WebApp || window.IS_TELEGRAM_MINI_APP) {
        console.log('Skipping regular initialization because this is a Telegram Mini App');
        return;
    }
    
    console.log('Initializing standard web app');
    
    const contentManager = new ContentManager();
    const uiManager = new UiManager(contentManager);

    try {
        // Set up event listeners
        uiManager.setupHomeEventListeners();
        
        // Load content rows
        await uiManager.loadContentRows();
    } catch (error) {
        console.error('Initialization error:', error);
    }

    // Update metrics if Telegram user is available
    if (window.telegramApp?.user) {
        try {
            const userData = window.telegramApp.getUserData();
            await contentManager.api.updateUserMetrics(userData);
        } catch (error) {
            console.error('Error updating metrics:', error);
        }
    }
});

// Function to set up movie item clicks - define this OUTSIDE any event handlers
function setupMovieItemClicks() {
    // Skip in Telegram Mini App context
    if (window.Telegram?.WebApp || window.IS_TELEGRAM_MINI_APP) {
        return;
    }
    
    // Select all clickable movie elements - adjust selectors to match your HTML
    const movieItems = document.querySelectorAll('.content-card, .featured-card');
    
    movieItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't navigate if clicking on the like button
            if (e.target.closest('.likes')) {
                e.stopPropagation();
                return;
            }
            
            // Get the movie ID
            const contentId = this.dataset.movieId;
            if (!contentId) return;
            
            // Decide how to navigate based on context
            if (window.telegramApp) {
                window.telegramApp.navigateTo('pages/watch?id=' + contentId);
            } else {
                // Use direct URL navigation for non-Telegram context
                const baseUrl = window.location.origin;
                window.location.href = `${baseUrl}/pages/watch.html?id=${contentId}`;
            }
        });
    });
}