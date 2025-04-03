class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.contentState = {
            movies: [],
            currentMovie: null,
            categories: new Map(),
            searchResults: [],
            loading: false,
            error: null
        };
        
        // Check if running in Telegram Mini App
        this.isTelegramMiniApp = !!window.Telegram?.WebApp || window.IS_TELEGRAM_MINI_APP;
        
        // Get the base path for GitHub Pages
        this.basePath = this.getBasePath();

        // Bind methods
        this.navigate = this.navigate.bind(this);
        this.handlePopState = this.handlePopState.bind(this);

        // Initialize
        this.initializeRouter();
        
        console.log('Router initialized. Telegram Mini App:', this.isTelegramMiniApp);
    }
    
    // Helper to get the correct base path for GitHub Pages
    getBasePath() {
        // For GitHub Pages, we need to consider the repository name in the path
        const isGitHubPages = window.location.hostname.includes('github.io');
        if (isGitHubPages) {
            // Extract repository name from path
            const pathSegments = window.location.pathname.split('/');
            if (pathSegments.length > 1) {
                // Return /repo-name for GitHub Pages
                return '/' + pathSegments[1];
            }
        }
        return ''; // No base path for local development
    }

    initializeRouter() {
        // Handle browser back/forward buttons (only if not in Telegram Mini App)
        if (!this.isTelegramMiniApp) {
            window.addEventListener('popstate', this.handlePopState);
        }

        // Define routes
        this.routes.set('/', { 
            component: 'home',
            init: () => this.initHome()
        });
        this.routes.set('/watch', {
            component: 'watch',
            init: (params) => this.initWatch(params)
        });
        this.routes.set('/activity', {
            component: 'activity',
            init: () => this.initActivity()
        });
        this.routes.set('/account', {
            component: 'account',
            init: () => this.initAccount()
        });
        this.routes.set('/search', {
            component: 'search',
            init: (params) => this.initSearch(params)
        });
        
        // Initial route (skip if in Telegram Mini App - it will call navigate directly)
        if (!this.isTelegramMiniApp) {
            this.handleCurrentLocation();
        }
    }
    
    // Handle the current URL when the page loads
    handleCurrentLocation() {
        // Get the path relative to the base path
        let path = window.location.pathname;
        if (this.basePath && path.startsWith(this.basePath)) {
            path = path.slice(this.basePath.length) || '/';
        }
        
        // Parse query parameters
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        
        // Navigate to the current path
        this.navigate(path, params, true);
    }

    async navigate(path, params = {}, replaceState = false) {
        console.log(`Navigating to: ${path}`, params);
        
        // Show loading state
        this.contentState.loading = true;
        this.updateUI();

        try {
            // Find the route
            const route = this.routes.get(path) || this.routes.get('/');
            this.currentRoute = route;

            // Update URL, considering the base path
            if (!this.isTelegramMiniApp) {
                const url = new URL(this.basePath + path, window.location.origin);
                Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));
                
                // Use either pushState or replaceState
                if (replaceState) {
                    window.history.replaceState({}, '', url);
                } else {
                    window.history.pushState({}, '', url);
                }
            }

            // Initialize the route
            await route.init(params);

            // Update UI
            this.contentState.loading = false;
            this.updateUI();

        } catch (error) {
            console.error('Navigation error:', error);
            this.contentState.error = error.message;
            this.contentState.loading = false;
            this.updateUI();
        }
    }

    handlePopState() {
        // Skip in Telegram Mini App
        if (this.isTelegramMiniApp) return;
        
        // Get the path relative to the base path
        let path = window.location.pathname;
        if (this.basePath && path.startsWith(this.basePath)) {
            path = path.slice(this.basePath.length) || '/';
        }
        
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        this.navigate(path, params, true);
    }

    async initHome() {
        try {
            console.log('Initializing home page');
            // Clear previous state
            this.contentState.currentMovie = null;
            
            // Fetch movies if not already loaded
            if (this.contentState.movies.length === 0) {
                // Get the API URL from config to ensure it's using the correct backend URL
                const apiUrl = window.StreamFlixConfig?.API_URL || 'https://streamflix-backend.onrender.com/api';
                console.log('Fetching movies from:', apiUrl);
                
                try {
                    const response = await fetch(`${apiUrl}/content`);
                    
                    if (!response.ok) {
                        // If the /movies endpoint fails, try the sample video endpoint
                        console.log('Falling back to sample video endpoint');
                        const sampleResponse = await fetch(`${apiUrl}/content/video`);
                        if (!sampleResponse.ok) throw new Error('Failed to fetch sample video');
                        
                        const sampleVideo = await sampleResponse.json();
                        this.contentState.movies = [sampleVideo];
                    } else {
                        this.contentState.movies = await response.json();
                    }
                } catch (error) {
                    console.error('Error fetching movies:', error);
                    // Try sample video as fallback
                    this.contentState.movies = [{
                        _id: "sample-video-1",
                        title: "Big Buck Bunny",
                        description: "This is a sample video",
                        posterImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
                    }];
                }
            }

            // Update UI
            document.querySelector('.app-container').innerHTML = this.getHomeTemplate();
            this.setupHomeEventListeners();

        } catch (error) {
            console.error('Home initialization error:', error);
            this.contentState.error = error.message;
        }
    }

    async initWatch(params) {
        try {
            if (!params.id) throw new Error('Movie ID is required');

            // Fetch movie details
            const apiUrl = window.StreamFlixConfig?.API_URL || 'https://streamflix-backend.onrender.com/api';
            const response = await fetch(`${apiUrl}/content/${params.id}`);
            if (!response.ok) throw new Error('Failed to fetch movie details');
            this.contentState.currentMovie = await response.json();

            // Update UI
            document.querySelector('.app-container').innerHTML = this.getWatchTemplate();
            this.setupWatchEventListeners();

        } catch (error) {
            console.error('Watch initialization error:', error);
            this.contentState.error = error.message;
        }
    }

    // Similar init methods for other routes...

    updateUI() {
        // Update loading state
        const loadingEl = document.querySelector('.loading-indicator');
        if (loadingEl) {
            loadingEl.style.display = this.contentState.loading ? 'block' : 'none';
        }

        // Update error state
        const errorEl = document.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = this.contentState.error || '';
            errorEl.style.display = this.contentState.error ? 'block' : 'none';
        }

        // Update navigation state
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const path = item.dataset.path;
            item.classList.toggle('active', path === this.currentRoute?.component);
        });
    }

    // Template methods
    getHomeTemplate() {
        return `
            <div class="home-container">
                <!-- Hero Section -->
                <div class="hero-card">
                    <div class="featured-card" id="featured-movie">
                        <div class="badge">Featured</div>
                        <div class="likes" id="featured-like">
                            <i class="fas fa-thumbs-up"></i>
                            <span>1.5K</span>
                        </div>
                        <img src="https://archive.org/services/img/earth-vs-the-flying-saucers-color" alt="Featured Movie">
                        <div class="title-container">
                            <h2>Earth vs the Flying Saucers</h2>
                        </div>
                    </div>
                </div>
                
                <!-- Content Sections -->
                <div id="category-container">
                    <!-- Movies Section -->
                    <div class="section">
                        <div class="section-header">
                            <h3>Movies</h3>
                        </div>
                        <div class="content-row">
                            ${this.contentState.movies.map(movie => this.getMovieCardTemplate(movie)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getMovieCardTemplate(movie) {
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

    getWatchTemplate() {
        const movie = this.contentState.currentMovie;
        return `
            <div class="watch-container">
                <div class="video-container">
                    <video id="video-player" controls>
                        <source src="${movie.videoUrl || ''}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
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

    // Event listener setup methods
    setupHomeEventListeners() {
        // Set up movie click handlers
        document.querySelectorAll('.content-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const movieId = card.dataset.movieId;
                if (movieId) {
                    this.navigate('/watch', { id: movieId });
                }
            });
        });

        // Set up search
        const searchInput = document.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        this.navigate('/search', { q: query });
                    }
                }
            });
        }
    }

    setupWatchEventListeners() {
        // Set up video player controls
        const videoPlayer = document.querySelector('#video-player');
        if (videoPlayer) {
            videoPlayer.addEventListener('play', () => {
                console.log('Video started playing');
            });
        }
        
        // Set up back button
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.navigate('/');
            });
        }
    }
} 