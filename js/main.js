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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Skip initialization if we're in a Telegram Mini App context
    if (window.Telegram?.WebApp || window.IS_TELEGRAM_MINI_APP) {
        console.log('Skipping regular initialization because this is a Telegram Mini App');
        return;
    }
    
    console.log('Initializing standard web app');
    
    const contentManager = new ContentManager();
    const uiManager = new UiManager(contentManager);

    // Initialize content
    try {
        await contentManager.loadMovies();
        uiManager.updateHomeContent();
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
            
            // Check if we have a content ID (from API)
            const contentId = this.dataset.contentId;
            
            if (contentId) {
                console.log('Clicked on content with ID:', contentId);
                // Use Telegram navigation if available
                if (window.telegramApp) {
                    window.telegramApp.navigateTo('pages/watch?id=' + contentId);
                } else {
                    window.location.href = 'pages/watch?id=' + contentId;
                }
            }
        });
    });
}

// Add interactivity to the Netflix-like interface
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for Telegram WebApp to be ready (if available)
    if (window.telegramApp) {
        // Update metrics with Telegram user data
        try {
            const userData = window.telegramApp.getUserData();
            const response = await fetch(`${getApiUrl()}/metrics/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update user metrics');
            }
            
            console.log('Updated metrics with Telegram user data');
        } catch (error) {
            console.error('Error updating metrics:', error);
        }
    }
    
    // Update hero content first with random featured content
    updateHeroContent();
    
    // Generate category sections
    generateCategorySections();
    
    // Then populate carousels
    populateCarousels();
    
    // Add this line at the end of your initialization
    setupMovieItemClicks();
    
    // Navigation bar functionality with Telegram support
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the target page from the nav item
            const targetPage = this.dataset.page;
            
            // Navigate using Telegram navigation if available
            if (targetPage) {
                if (window.telegramApp) {
                    window.telegramApp.navigateTo('pages/' + targetPage);
                } else {
                    window.location.href = 'pages/' + targetPage;
                }
            }
        });
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-field input');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchQuery = this.value.trim();
                if (searchQuery) {
                    if (window.telegramApp) {
                        window.telegramApp.navigateTo('pages/search?q=' + encodeURIComponent(searchQuery));
                    } else {
                        window.location.href = 'pages/search?q=' + encodeURIComponent(searchQuery);
                    }
                }
            }
        });
    }
});

// Function to update hero content with featured content from API
async function updateHeroContent() {
    try {
        // Fetch content from the API
        const contentData = await getAllContent();
        
        // If no content is returned or there's an error, use fallback data
        if (!contentData || contentData.length === 0) {
            console.log("No content found in API for hero, using fallback data");
            useFallbackHeroContent();
            return;
        }
        
        // Select a random content item for the hero
        const randomIndex = Math.floor(Math.random() * contentData.length);
        const featured = contentData[randomIndex];
        
        // Update the hero card
        const heroCard = document.querySelector('.featured-card');
        if (heroCard) {
            heroCard.innerHTML = `
                <div class="badge">Trending</div>
                <img src="${featured.posterImage}" alt="${featured.title}">
                <div class="likes"><i class="fas fa-thumbs-up"></i> ${featured.likes || 0}</div>
                <div class="title-container">
                    <h2>${featured.title}</h2>
                </div>
            `;
            
            // Store the content ID as a data attribute for navigation
            heroCard.dataset.contentId = featured._id;
        }
        
    } catch (error) {
        console.error("Error fetching content for hero:", error);
        useFallbackHeroContent();
    }
}
  
    // Fallback function for hero content
    function useFallbackHeroContent() {
        // Your existing updateHeroContent code here
      const featuredContent = [
          { title: "The Witcher", likes: "20", img: "https://images.unsplash.com/photo-1626197031507-c17099753214" },
          { title: "Stranger Things", likes: "18", img: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac" },
          { title: "Dune", likes: "25", img: "https://images.unsplash.com/photo-1547700055-b61cacebece9" },
          { title: "The Batman", likes: "22", img: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb" },
          { title: "Squid Game", likes: "27", img: "https://images.unsplash.com/photo-1634157703702-3c124b455499" },
          { title: "Loki", likes: "19", img: "https://images.unsplash.com/photo-1624213111452-35e8d3d5cc18" },
          { title: "The Queen's Gambit", likes: "21", img: "https://images.unsplash.com/photo-1586165368502-1bad197a6461" }
      ];
      
      // Select a random featured content
      const randomIndex = Math.floor(Math.random() * featuredContent.length);
      const featured = featuredContent[randomIndex];
      
      // Update the hero card
      const heroCard = document.querySelector('.featured-card');
      if (heroCard) {
          heroCard.innerHTML = `
              <div class="badge">Trending</div>
              <img src="${featured.img}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="${featured.title}">
              <div class="likes"><i class="fas fa-thumbs-up"></i> ${featured.likes}</div>
              <div class="title-container">
                  <h2>${featured.title}</h2>
              </div>
          `;
      }
  }
  
  // Function to generate 25 category sections with random titles
  function generateCategorySections() {
      const categoryContainer = document.getElementById('category-container');
      
      if (!categoryContainer) {
          console.error("Category container not found. Creating it...");
          // Create the container if it doesn't exist
          const newContainer = document.createElement('div');
          newContainer.id = 'category-container';
          document.querySelector('.app-container').appendChild(newContainer);
          
          // Now use the newly created container
          generateCategorySections();
          return;
      }
      
      // Clear existing content
      categoryContainer.innerHTML = '';
      
      // Netflix-style category names - expanded list for more variety
      const netflixStyleCategories = [
          "Continue Watching",
          "Top Movies",
          "Top TV Shows",
          "Action",
          "Trending Now",
          "Popular on StreamFlix",
          "New Releases",
          "Award-Winning TV Shows",
          "Bingeworthy TV Shows",
          "Critically Acclaimed Movies",
          "Because You Watched The Witcher",
          "Top 10 in Your Country Today",
          "Emotional Dramas",
          "Sci-Fi & Fantasy",
          "Suspenseful Movies",
          "Comedies",
          "Crime TV Shows",
          "Documentaries",
          "Feel-Good Movies",
          "Romantic Movies",
          "Thrillers",
          "Horror Movies",
          "International Films",
          "Independent Movies",
          "Family-Friendly Movies",
          "Anime",
          "Reality TV",
          "Stand-up Comedy",
          "Music & Musicals",
          "Classic Movies",
          "Action & Adventure",
          "Supernatural",
          "Teen Movies & Shows",
          "Mysteries",
          "Psychological Thrillers",
          "True Crime Documentaries",
          "Blockbuster Movies",
          "Hidden Gems",
          "Movies Based on Books",
          "Award Winners",
          "Cult Classics",
          "Cerebral Movies",
          "Heartfelt Movies",
          "Quirky Comedies",
          "Spy Thrillers",
          "Period Pieces",
          "Political Dramas",
          "Sports Movies",
          "Martial Arts Movies",
          "Movies with Strong Female Leads"
      ];
      
      // Shuffle the categories array to get random selection
      const shuffledCategories = [...netflixStyleCategories].sort(() => 0.5 - Math.random());
      
      // Always keep "Continue watching" as the first category
      const finalCategories = ["Continue Watching"];
      
      // Add 24 more random categories (avoiding duplicates)
      for (let i = 0; i < 24; i++) {
          if (i < shuffledCategories.length) {
              finalCategories.push(shuffledCategories[i]);
          }
      }
      
      // Create 25 category sections
      for (let i = 0; i < 25; i++) {
          if (i < finalCategories.length) {
              const section = document.createElement('div');
              section.className = 'section';
              
              section.innerHTML = `
                  <div class="section-header">
                      <h3>${finalCategories[i]}</h3>
                      <i class="fas fa-chevron-right"></i>
                  </div>
                  <div class="content-row">
                      <!-- Content will be populated by JavaScript -->
                  </div>
              `;
              
              categoryContainer.appendChild(section);
          }
      }
      
      console.log("Generated 25 category sections with random titles");
  }
  
  // Function to populate carousels with content from the API
async function populateCarousels() {
    try {
        // Fetch content from the API
        const contentData = await getAllContent();
        
        // If no content is returned or there's an error, use fallback data
        if (!contentData || contentData.length === 0) {
            console.log("No content found in API, using fallback data");
            useFallbackContent();
            return;
        }
        
        // Get all content rows
        const contentRows = document.querySelectorAll('.content-row');
        
        if (contentRows.length === 0) {
            console.error("No content rows found. Check your HTML structure.");
            return;
        }
        
        // Update each content row with movies
        contentRows.forEach((row) => {
            // Clear existing content
            row.innerHTML = '';
            
            // Shuffle the content data to get random selection
            const shuffledContent = [...contentData].sort(() => 0.5 - Math.random());
            
            // Add content items to the row (up to 15 or as many as available)
            const itemCount = Math.min(15, shuffledContent.length);
            for (let i = 0; i < itemCount; i++) {
                const content = shuffledContent[i];
                
                const card = document.createElement('div');
                card.className = 'content-card';
                
                card.innerHTML = `
                    <img src="${content.posterImage}" alt="${content.title}">
                    <div class="card-info">
                        <p>${content.title}</p>
                        <div class="card-details">
                            <span>${content.releaseYear || 'N/A'}</span>
                            ${content.duration ? `<span>• ${content.duration}</span>` : ''}
                        </div>
                    </div>
                `;
                
                // Store the content ID as a data attribute for navigation
                card.dataset.contentId = content._id;
                
                row.appendChild(card);
            }
        });
        
        console.log("Carousels populated with API content");
        
        // Set up click handlers for the new content cards
        setupMovieItemClicks();
        
    } catch (error) {
        console.error("Error fetching content from API:", error);
        useFallbackContent();
    }
}

// Fallback function to use hardcoded data if API fails
function useFallbackContent() {
    // Your existing populateCarousels code here
    // This is the current implementation that uses hardcoded data
    
    // Sample movie and TV show data with better images
      const contentData = [
          { 
              title: "Big Buck Bunny",
              year: "2008",
              type: "movie",
              img: "https://peach.blender.org/wp-content/uploads/bbb-splash.png",
              _id: "bbb",
              duration: "10m",
              posterImage: "https://peach.blender.org/wp-content/uploads/bbb-splash.png"
          },
          { title: "The Matrix", year: "1999", type: "movie", img: "https://images.unsplash.com/photo-1558486012-817176f84c6d" },
          { title: "Blade Runner", year: "1982", type: "movie", img: "https://images.unsplash.com/photo-1478720568477-152d9b164e26" },
          { title: "Inception", year: "2010", type: "movie", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1" },
          { title: "Stranger Things", year: "2016", type: "tv", img: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac" },
          { title: "Interstellar", year: "2014", type: "movie", img: "https://images.unsplash.com/photo-1506901437675-cde80ff9c746" },
          { title: "Dune", year: "2021", type: "movie", img: "https://images.unsplash.com/photo-1547700055-b61cacebece9" },
          { title: "The Batman", year: "2022", type: "movie", img: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb" },
          { title: "Avengers", year: "2012", type: "movie", img: "https://images.unsplash.com/photo-1624213111452-35e8d3d5cc18" },
          { title: "Star Wars", year: "1977", type: "movie", img: "https://images.unsplash.com/photo-1547700055-b61cacebece9" },
          { title: "Joker", year: "2019", type: "movie", img: "https://images.unsplash.com/photo-1559583109-3e7968136c99" },
          { title: "Parasite", year: "2019", type: "movie", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1" },
          { title: "1917", year: "2019", type: "movie", img: "https://images.unsplash.com/photo-1547700055-b61cacebece9" },
          { title: "Tenet", year: "2020", type: "movie", img: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1" },
          { title: "No Time To Die", year: "2021", type: "movie", img: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb" },
          { title: "Black Widow", year: "2021", type: "movie", img: "https://images.unsplash.com/photo-1624213111452-35e8d3d5cc18" },
          { title: "The Godfather", year: "1972", type: "movie", img: "https://images.unsplash.com/photo-1581985673473-0784a7a44e39" },
          { title: "Pulp Fiction", year: "1994", type: "movie", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "The Dark Knight", year: "2008", type: "movie", img: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb" },
          { title: "Fight Club", year: "1999", type: "movie", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "Forrest Gump", year: "1994", type: "movie", img: "https://images.unsplash.com/photo-1581985673473-0784a7a44e39" },
          { title: "The Shawshank Redemption", year: "1994", type: "movie", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "The Lord of the Rings", year: "2001", type: "movie", img: "https://images.unsplash.com/photo-1547700055-b61cacebece9" },
          { title: "Breaking Bad", year: "2008", type: "tv", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "Game of Thrones", year: "2011", type: "tv", img: "https://images.unsplash.com/photo-1562813733-b31f0941fd52" },
          { title: "The Queen's Gambit", year: "2020", type: "tv", img: "https://images.unsplash.com/photo-1586165368502-1bad197a6461" },
          { title: "Money Heist", year: "2017", type: "tv", img: "https://images.unsplash.com/photo-1601024445121-e5b82f020549" },
          { title: "Dark", year: "2017", type: "tv", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "The Mandalorian", year: "2019", type: "tv", img: "https://images.unsplash.com/photo-1547700055-b61cacebece9" },
          { title: "Squid Game", year: "2021", type: "tv", img: "https://images.unsplash.com/photo-1634157703702-3c124b455499" },
          { title: "Bridgerton", year: "2020", type: "tv", img: "https://images.unsplash.com/photo-1581985673473-0784a7a44e39" },
          { title: "Loki", year: "2021", type: "tv", img: "https://images.unsplash.com/photo-1624213111452-35e8d3d5cc18" },
          { title: "The Witcher", year: "2019", type: "tv", img: "https://images.unsplash.com/photo-1626197031507-c17099753214" },
          { title: "Peaky Blinders", year: "2013", type: "tv", img: "https://images.unsplash.com/photo-1581985673473-0784a7a44e39" },
          { title: "The Boys", year: "2019", type: "tv", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1" },
          { title: "Ozark", year: "2017", type: "tv", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "Mindhunter", year: "2017", type: "tv", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "The Office", year: "2005", type: "tv", img: "https://images.unsplash.com/photo-1504593811423-6dd665756598" },
          { title: "Friends", year: "1994", type: "tv", img: "https://images.unsplash.com/photo-1581985673473-0784a7a44e39" },
          { title: "Sherlock", year: "2010", type: "tv", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "Black Mirror", year: "2011", type: "tv", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "The Last Dance", year: "2020", type: "tv", img: "https://images.unsplash.com/photo-1504593811423-6dd665756598" },
          { title: "Tiger King", year: "2020", type: "tv", img: "https://images.unsplash.com/photo-1504593811423-6dd665756598" },
          { title: "Narcos", year: "2015", type: "tv", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "The Umbrella Academy", year: "2019", type: "tv", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1" },
          { title: "Lupin", year: "2021", type: "tv", img: "https://images.unsplash.com/photo-1581985673473-0784a7a44e39" },
          { title: "The Haunting of Hill House", year: "2018", type: "tv", img: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a" },
          { title: "Cobra Kai", year: "2018", type: "tv", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1" }
      ];
      
      // Get all content rows
      const contentRows = document.querySelectorAll('.content-row');
      
      if (contentRows.length === 0) {
          console.error("No content rows found. Check your HTML structure.");
          return;
      }
      
      // Update each content row with movies
      contentRows.forEach((row) => {
          // Clear existing content
          row.innerHTML = '';
          
          // Shuffle the content data to get random selection
          const shuffledContent = [...contentData].sort(() => 0.5 - Math.random());
          
          // Add 15 content items to the row
          for (let i = 0; i < 15; i++) {
              const content = shuffledContent[i % shuffledContent.length];
              
              const card = document.createElement('div');
              card.className = 'content-card';
              
              card.innerHTML = `
                  <img src="${content.img}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="${content.title}">
                  <div class="card-info">
                      <p>${content.title}</p>
                  </div>
              `;
              
              row.appendChild(card);
          }
      });
      
      console.log("Carousels populated with content");
  }
  
  // Function to set up search navigation
  function setupSearchNavigation() {
      const searchTrigger = document.getElementById('search-trigger');
      
      if (searchTrigger) {
          // Make the entire search field clickable
          searchTrigger.addEventListener('click', function() {
              window.location.href = 'pages/search';
          });
          
          // Also make the icons inside the search field clickable
          const searchIcon = searchTrigger.querySelector('.fa-search');
          const voiceIcon = searchTrigger.querySelector('.fa-microphone');
          const searchInput = searchTrigger.querySelector('input');
          
          if (searchIcon) {
              searchIcon.addEventListener('click', function(e) {
                  e.stopPropagation(); // Prevent double triggering
                  window.location.href = 'pages/search';
              });
          }
          
          if (voiceIcon) {
              voiceIcon.addEventListener('click', function(e) {
                  e.stopPropagation(); // Prevent double triggering
                  window.location.href = 'pages/search';
              });
          }
          
          if (searchInput) {
              searchInput.addEventListener('click', function(e) {
                  e.stopPropagation(); // Prevent double triggering
                  window.location.href = 'pages/search';
              });
              
              // Also trigger on focus attempt
              searchInput.addEventListener('focus', function(e) {
                  window.location.href = 'pages/search';
              });
          }
      }
  }

// Helper function to get the API URL
function getApiUrl() {
    return window.StreamFlixConfig?.API_URL || '/api';
}