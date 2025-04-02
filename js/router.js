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
        
        // Get the base path for GitHub Pages
        this.basePath = this.getBasePath();

        // Bind methods
        this.navigate = this.navigate.bind(this);
        this.handlePopState = this.handlePopState.bind(this);

        // Initialize
        this.initializeRouter();
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
        // Handle browser back/forward buttons
        window.addEventListener('popstate', this.handlePopState);

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
        
        // Initial route
        this.handleCurrentLocation();
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
        // Show loading state
        this.contentState.loading = true;
        this.updateUI();

        try {
            // Find the route
            const route = this.routes.get(path) || this.routes.get('/');
            this.currentRoute = route;

            // Update URL, considering the base path
            const url = new URL(this.basePath + path, window.location.origin);
            Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));
            
            // Use either pushState or replaceState
            if (replaceState) {
                window.history.replaceState({}, '', url);
            } else {
                window.history.pushState({}, '', url);
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
            // Clear previous state
            this.contentState.currentMovie = null;
            
            // Fetch movies if not already loaded
            if (this.contentState.movies.length === 0) {
                // Get the API URL from config to ensure it's using the correct backend URL
                const apiUrl = window.StreamFlixConfig?.API_URL || '/api';
                const response = await fetch(`${apiUrl}/movies`);
                if (!response.ok) throw new Error('Failed to fetch movies');
                this.contentState.movies = await response.json();
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
            const response = await fetch(`/api/movies/${params.id}`);
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
                <!-- Your existing home template -->
            </div>
        `;
    }

    getWatchTemplate() {
        const movie = this.contentState.currentMovie;
        return `
            <div class="watch-container">
                <!-- Your existing watch template -->
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
        // Set up like/share buttons
        // etc...
    }
} 