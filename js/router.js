class Router {
    constructor() {
        console.log('Router constructor starting');
        
        this.routes = {
            '/': {
                template: null, // Will use index.html's default content
                init: this.initHomePage
            },
            '/watch': {
                template: null, // Will be set dynamically
                init: this.initWatchPage
            },
            '/search': {
                template: this.getSearchTemplate(),
                init: this.initSearchPage
            },
            '/profile': {
                template: this.getProfileTemplate(),
                init: this.initProfilePage
            }
        };

        this.currentPath = '/';
        this.params = {};
        
        // Add history state handling
        try {
            window.addEventListener('popstate', (e) => this.handlePopState(e));
            console.log('PopState event handler registered');
        } catch (error) {
            console.error('Failed to register popstate handler:', error);
            window.debugError?.('Failed to register popstate handler: ' + error.message, error);
        }
        
        console.log('Router initialized successfully');
    }

    handlePopState(e) {
        console.log('PopState event triggered', e.state);
        if (e.state && e.state.path) {
            this.navigateTo(e.state.path, e.state.params || {}, true);
        }
    }

    navigateTo(path, params = {}, skipHistory = false) {
        try {
            console.log(`Navigating to: ${path}`, params);
            
            // Store current state
            this.currentPath = path;
            this.params = params;

            // Add to browser history
            if (!skipHistory) {
                window.history.pushState({ path, params }, '', this.getFullPath(path, params));
            }

            // Get route configuration
            const route = this.routes[path];
            if (!route) {
                console.error('Route not found:', path);
                window.debugError?.('Route not found: ' + path);
                return this.navigateTo('/'); // Redirect to home on error
            }

            // If template is defined, update content
            if (route.template) {
                console.log('Setting HTML template for route:', path);
                document.querySelector('.app-container').innerHTML = route.template;
            }

            // Initialize page-specific functionality
            if (typeof route.init === 'function') {
                console.log('Initializing route:', path);
                try {
                    route.init.call(this, params);
                    console.log('Route initialization completed successfully:', path);
                } catch (error) {
                    console.error('Error initializing route:', error);
                    window.debugError?.('Error initializing route: ' + error.message, error);
                }
            }

            // Update UI based on current route
            this.updateUI();
            
            return true;
        } catch (error) {
            console.error('Navigation error:', error);
            window.debugError?.('Navigation error: ' + error.message, error);
            return false;
        }
    }

    getFullPath(path, params) {
        // Create a URL with path and query parameters
        try {
            if (Object.keys(params).length === 0) return path;
            
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
                
            return `${path}?${queryString}`;
        } catch (error) {
            console.error('Error generating path:', error);
            window.debugError?.('Error generating path: ' + error.message, error);
            return path;
        }
    }

    updateUI() {
        try {
            console.log('Updating UI for route:', this.currentPath);
            
            // Show/hide back button based on current route
            if (window.Telegram && window.Telegram.WebApp) {
                if (this.currentPath === '/') {
                    window.Telegram.WebApp.BackButton.hide();
                } else {
                    window.Telegram.WebApp.BackButton.show();
                }
            }
        } catch (error) {
            console.error('Error updating UI:', error);
            window.debugError?.('Error updating UI: ' + error.message, error);
        }
    }

    // Route-specific initialization functions
    initHomePage() {
        try {
            console.log('Initializing home page');
            // Setup event listeners 
            const container = document.querySelector('.app-container');
            if (!container) {
                console.error('App container not found');
                window.debugError?.('App container not found');
                return;
            }
            
            // Set up click handlers for movie cards
            container.addEventListener('click', (e) => {
                // Find the closest content-card parent
                const card = e.target.closest('.content-card');
                if (card) {
                    const movieId = card.dataset.movieId;
                    if (movieId) {
                        console.log('Movie card clicked, ID:', movieId);
                        this.navigateTo('/watch', { id: movieId });
                    }
                }
            });
            
            // Trigger content loading
            if (window.contentManager) {
                window.contentManager.loadMovies()
                    .then(() => window.uiManager.updateHomeContent())
                    .catch(err => {
                        console.error('Failed to load movies:', err);
                        window.debugError?.('Failed to load movies: ' + err.message, err);
                    });
            } else {
                console.log('Content manager not initialized yet');
            }
            
            console.log('Home page initialization completed');
        } catch (error) {
            console.error('Error initializing home page:', error);
            window.debugError?.('Error initializing home page: ' + error.message, error);
        }
    }

    initWatchPage(params) {
        try {
            console.log('Initializing watch page with params:', params);
            
            // Get movie ID from params
            const movieId = params.id;
            if (!movieId) {
                console.error('No movie ID provided');
                window.debugError?.('No movie ID provided for watch page');
                return this.navigateTo('/');
            }
            
            // Load movie details and update UI
            window.contentManager.getMovieById(movieId)
                .then(movie => {
                    console.log('Movie loaded:', movie);
                    window.uiManager.updateWatchContent(movie);
                })
                .catch(err => {
                    console.error('Failed to load movie:', err);
                    window.debugError?.('Failed to load movie: ' + err.message, err);
                    this.navigateTo('/');
                });
                
            console.log('Watch page initialization completed');
        } catch (error) {
            console.error('Error initializing watch page:', error);
            window.debugError?.('Error initializing watch page: ' + error.message, error);
        }
    }

    initSearchPage(params) {
        try {
            console.log('Initializing search page with params:', params);
            
            // Get search query from params
            const query = params.query || '';
            
            // Set up search input field
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = query;
                searchInput.focus();
                
                // Handle search input
                searchInput.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        const searchQuery = searchInput.value.trim();
                        if (searchQuery) {
                            console.log('Search query submitted:', searchQuery);
                            this.performSearch(searchQuery);
                        }
                    }
                });
            }
            
            // Set up back button
            const backButton = document.querySelector('.back-button');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    console.log('Search back button clicked');
                    this.navigateTo('/');
                });
            }
            
            // Perform search if query is provided
            if (query) {
                console.log('Initial search with query:', query);
                this.performSearch(query);
            }
            
            console.log('Search page initialization completed');
        } catch (error) {
            console.error('Error initializing search page:', error);
            window.debugError?.('Error initializing search page: ' + error.message, error);
        }
    }

    performSearch(query) {
        try {
            console.log('Performing search with query:', query);
            
            const resultsContainer = document.querySelector('.search-results');
            if (!resultsContainer) {
                console.error('Search results container not found');
                window.debugError?.('Search results container not found');
                return;
            }
            
            // Show loading state
            resultsContainer.innerHTML = '<div class="loading-spinner">Searching...</div>';
            
            // Perform search
            window.contentManager.searchMovies(query)
                .then(results => {
                    console.log('Search results:', results);
                    
                    if (results.length === 0) {
                        resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
                        return;
                    }
                    
                    // Display results
                    resultsContainer.innerHTML = results.map(movie => 
                        window.uiManager.createMovieCard(movie)
                    ).join('');
                    
                    // Set up click handlers for results
                    resultsContainer.addEventListener('click', (e) => {
                        const card = e.target.closest('.content-card');
                        if (card) {
                            const movieId = card.dataset.movieId;
                            if (movieId) {
                                this.navigateTo('/watch', { id: movieId });
                            }
                        }
                    });
                })
                .catch(err => {
                    console.error('Search failed:', err);
                    window.debugError?.('Search failed: ' + err.message, err);
                    resultsContainer.innerHTML = '<div class="error">Search failed. Please try again.</div>';
                });
        } catch (error) {
            console.error('Error in search function:', error);
            window.debugError?.('Error in search function: ' + error.message, error);
        }
    }

    initProfilePage() {
        try {
            console.log('Initializing profile page');
            
            // Get user data from Telegram if available
            let userData = { name: 'Guest User', username: 'guest' };
            
            if (window.Telegram && window.Telegram.WebApp) {
                const user = window.Telegram.WebApp.initDataUnsafe?.user;
                if (user) {
                    userData = {
                        name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
                        username: user.username || 'unknown',
                        photoUrl: user.photo_url
                    };
                }
            }
            
            // Update profile UI with user data
            const userNameElement = document.getElementById('user-name');
            const userHandleElement = document.getElementById('user-handle');
            const userImageElement = document.getElementById('user-image');
            
            if (userNameElement) userNameElement.textContent = userData.name;
            if (userHandleElement) userHandleElement.textContent = '@' + userData.username;
            
            if (userImageElement && userData.photoUrl) {
                userImageElement.src = userData.photoUrl;
            }
            
            // Set up back button
            const backButton = document.querySelector('.back-button');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    this.navigateTo('/');
                });
            }
            
            console.log('Profile page initialization completed');
        } catch (error) {
            console.error('Error initializing profile page:', error);
            window.debugError?.('Error initializing profile page: ' + error.message, error);
        }
    }

    // Template string getters
    getSearchTemplate() {
        return `
            <div class="search-page">
                <div class="search-header">
                    <div class="back-button">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                    <div class="search-input-container">
                        <i class="fas fa-search"></i>
                        <input type="text" id="search-input" placeholder="Search movies...">
                        <i class="fas fa-microphone"></i>
                    </div>
                </div>
                <div class="search-results">
                    <!-- Results will be loaded here -->
                </div>
            </div>
        `;
    }

    getProfileTemplate() {
        return `
            <div class="profile-page">
                <div class="profile-header">
                    <div class="back-button">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                    <h2>Profile</h2>
                </div>
                <div class="profile-content">
                    <div class="user-info">
                        <img id="user-image" src="https://via.placeholder.com/100" alt="User">
                        <h3 id="user-name">User Name</h3>
                        <p id="user-handle">@username</p>
                    </div>
                    <div class="stats">
                        <div class="stat-item">
                            <span class="stat-value">15</span>
                            <span class="stat-label">Watched</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">23</span>
                            <span class="stat-label">Likes</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">7</span>
                            <span class="stat-label">Lists</span>
                        </div>
                    </div>
                    <div class="section-label">Watch History</div>
                    <div class="history-list">
                        <!-- Placeholder items -->
                        <div class="history-item">
                            <img src="https://via.placeholder.com/50" alt="Movie">
                            <div class="history-info">
                                <h4>The Movie Title</h4>
                                <p>Watched today</p>
                            </div>
                        </div>
                        <div class="history-item">
                            <img src="https://via.placeholder.com/50" alt="Movie">
                            <div class="history-info">
                                <h4>Another Movie</h4>
                                <p>Watched yesterday</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
} 