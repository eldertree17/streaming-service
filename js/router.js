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
            '/account': {
                template: this.getProfileTemplate(),
                init: this.initProfilePage
            },
            '/activity': {
                template: this.getActivityTemplate(),
                init: this.initActivityPage
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

    initActivityPage() {
        try {
            console.log('Initializing activity page with direct content');
            
            // Inject CSS directly
            if (!document.head.querySelector('style#activity-css')) {
                const style = document.createElement('style');
                style.id = 'activity-css';
                style.textContent = `
                    /* Activity Page Styles */
                    .section {
                        margin-bottom: 20px;
                        padding: 0 15px;
                    }
                    
                    .section-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                        padding-bottom: 5px;
                    }
                    
                    .section-header h2 {
                        font-size: 28px;
                        font-weight: 600;
                        margin: 0;
                    }
                    
                    .section-header i {
                        font-size: 18px;
                        color: #aaa;
                    }
                    
                    /* DVD Seeding Section */
                    .earn-apy h3 {
                        font-size: 20px;
                        margin-bottom: 15px;
                        font-weight: 500;
                    }
                    
                    .stats-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    
                    .stat-item {
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .stat-label {
                        font-size: 14px;
                        color: #aaa;
                        margin-bottom: 5px;
                    }
                    
                    .stat-value {
                        font-size: 18px;
                        font-weight: 600;
                    }
                    
                    /* Earnings Summary */
                    .earnings-summary {
                        margin-top: 20px;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                        padding-top: 15px;
                    }
                    
                    .earnings-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    
                    .earnings-label {
                        font-size: 14px;
                        color: #aaa;
                    }
                    
                    .earnings-value {
                        font-size: 16px;
                        font-weight: 600;
                    }
                    
                    .percentage {
                        color: rgb(255, 87, 51);
                        margin-left: 5px;
                    }
                    
                    /* Roadmap Section */
                    .roadmap-timeline {
                        position: relative;
                        padding-left: 30px;
                    }
                    
                    .roadmap-timeline:before {
                        content: '';
                        position: absolute;
                        left: 15px;
                        top: 0;
                        bottom: 0;
                        width: 2px;
                        background: rgba(255, 255, 255, 0.2);
                    }
                    
                    .timeline-item {
                        position: relative;
                        margin-bottom: 30px;
                    }
                    
                    .timeline-icon {
                        position: absolute;
                        left: -30px;
                        width: 30px;
                        height: 30px;
                        background-color: rgb(255, 87, 51);
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1;
                    }
                    
                    .timeline-icon i {
                        color: #fff;
                        font-size: 14px;
                    }
                    
                    .timeline-content {
                        padding-left: 10px;
                    }
                    
                    .timeline-date {
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 5px;
                    }
                    
                    .timeline-text {
                        font-size: 14px;
                        color: #aaa;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Set up back button handler
            const backButton = document.querySelector('.back-button');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    console.log('Activity back button clicked, navigating home');
                    this.navigateTo('/');
                });
                console.log('Back button handler set up');
            } else {
                console.error('Back button not found');
            }
            
            // Set up section handlers
            setTimeout(() => {
                // Add click handlers for sections
                const dvdSeedingHeader = document.querySelector('.dvd-seeding-section .section-header');
                if (dvdSeedingHeader) {
                    dvdSeedingHeader.addEventListener('click', function() {
                        console.log('DVD Seeding section clicked');
                        alert('DVD Seeding details coming soon!');
                    });
                }
                
                // Roadmap section click handler
                const roadmapHeader = document.querySelector('.roadmap-section .section-header');
                if (roadmapHeader) {
                    roadmapHeader.addEventListener('click', function() {
                        console.log('Roadmap section clicked');
                        alert('Detailed roadmap coming soon!');
                    });
                }
                
                console.log('Activity page event handlers set up');
            }, 300);
            
            console.log('Activity page initialization completed');
        } catch (error) {
            console.error('Error initializing activity page:', error);
            window.debugError?.('Error initializing activity page: ' + error.message, error);
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

    getActivityTemplate() {
        return `
        <div class="page-container" style="padding: 15px; color: #fff;">
            <div class="header">
                <div class="back-button" style="margin-bottom: 15px;"><i class="fas fa-arrow-left"></i></div>
                <h1 style="font-size: 24px; margin-bottom: 20px; text-align: center;">Activity</h1>
            </div>

            <div class="section dvd-seeding-section">
                <div class="section-header">
                    <h2>DVD Seeding</h2>
                    <i class="fas fa-chevron-right"></i>
                </div>
                
                <div class="earn-apy">
                    <h3>Earn APY</h3>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">DVDs Seeded</div>
                            <div class="stat-value">500</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">APY</div>
                            <div class="stat-value">10%</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Earnings</div>
                            <div class="stat-value">$50</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Duration</div>
                            <div class="stat-value">Flexible ~ 1 Year</div>
                        </div>
                    </div>
                    
                    <div class="earnings-summary">
                        <div class="earnings-row">
                            <div class="earnings-label">Total earnings</div>
                            <div class="earnings-value">$250 <span class="percentage">+10%</span></div>
                        </div>
                        <div class="earnings-row">
                            <div class="earnings-label">Projected earnings</div>
                            <div class="earnings-value">$300 <span class="percentage">+20%</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section roadmap-section">
                <div class="section-header">
                    <h2>Roadmap</h2>
                    <i class="fas fa-chevron-right"></i>
                </div>
                
                <div class="roadmap-timeline">
                    <div class="timeline-item">
                        <div class="timeline-icon">
                            <i class="fas fa-gift"></i>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-date">Q1 2023</div>
                            <div class="timeline-text">Launch first library.</div>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-icon">
                            <i class="fas fa-crown"></i>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-date">Q2 2023</div>
                            <div class="timeline-text">Enable premier league.</div>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-date">Q3 2023</div>
                            <div class="timeline-text">Review and assessment of outcomes.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }
} 