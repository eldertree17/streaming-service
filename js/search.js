// Search Page Functionality

// Variable to prevent multiple initializations
let isSearchPageInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    // Prevent multiple initializations causing reloads
    if (isSearchPageInitialized) {
        console.log("Search page already initialized, preventing reload");
        return;
    }
    
    // Set initialization flag
    isSearchPageInitialized = true;
    
    // Initialize Telegram WebApp if available
    if (window.Telegram && window.Telegram.WebApp) {
        // Tell Telegram that the Mini App is ready
        window.Telegram.WebApp.ready();
        
        // Optionally expand the Mini App to full height
        window.Telegram.WebApp.expand();
        
        console.log("Telegram WebApp initialized");
    }
    
    // Initialize search page
    initSearchPage();
    
    // Set up back button
    setupBackButton();
});

// Prevent reload when coming from redirect
if (window.performance && window.performance.navigation) {
    if (window.performance.navigation.type === 1) {
        console.log("Page was reloaded, stopping initialization");
        isSearchPageInitialized = true;
    }
}

// Function to set up back button
function setupBackButton() {
  const backButton = document.getElementById('back-button');
  
  if (backButton) {
      backButton.addEventListener('click', function() {
          // Navigate back to home page using URL normalizer if available
          if (window.getAssetUrl) {
              window.location.href = window.getAssetUrl('index.html');
          } else {
              window.location.href = '/streaming-service/index.html';
          }
      });
  }
}

// Function to initialize the search page
function initSearchPage() {
  // Generate two category sections: "Continue watching" and "Trending now"
  generateSearchPageCategories();
  
  // Set up search input functionality
  setupSearchInput();
  
  // Set up content type tabs
  setupContentTypeTabs();
  
  // Set up genre pills
  setupGenrePills();
}

// Function to generate search page categories
function generateSearchPageCategories() {
  const categoryContainer = document.getElementById('category-container');
  
  if (!categoryContainer) {
      console.error("Category container not found");
      return;
  }
  
  // Clear existing content
  categoryContainer.innerHTML = '';
  
  // Create "Continue watching" section
  const continueWatchingSection = document.createElement('div');
  continueWatchingSection.className = 'section';
  continueWatchingSection.innerHTML = `
      <div class="section-header">
          <h3>Continue watching</h3>
          <i class="fas fa-chevron-right"></i>
      </div>
      <div class="content-row">
          <!-- Content will be populated by JavaScript -->
      </div>
  `;
  categoryContainer.appendChild(continueWatchingSection);
  
  // Create "Trending now" section
  const trendingSection = document.createElement('div');
  trendingSection.className = 'section';
  trendingSection.innerHTML = `
      <div class="section-header">
          <h3>Trending now</h3>
          <i class="fas fa-chevron-right"></i>
      </div>
      <div class="content-row">
          <!-- Content will be populated by JavaScript -->
      </div>
  `;
  categoryContainer.appendChild(trendingSection);
  
  // Populate the carousels
  populateSearchCarousels();
}

// Function to populate search page carousels
function populateSearchCarousels() {
  // Sample movie and TV show data
  const contentData = [
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
      { title: "Black Widow", year: "2021", type: "movie", img: "https://images.unsplash.com/photo-1624213111452-35e8d3d5cc18" }
  ];
  
  // Get all content rows
  const contentRows = document.querySelectorAll('.content-row');
  
  if (contentRows.length === 0) {
      console.error("No content rows found. Check your HTML structure.");
      return;
  }
  
  // Update each content row with movies
  contentRows.forEach((row, index) => {
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
          
          // Add click event handler for content cards
          card.addEventListener('click', function() {
              // Navigate to the watch page with the movie title
              const encodedTitle = encodeURIComponent(content.title);
              
              // Use URL normalizer if available
              if (window.getAssetUrl) {
                  window.location.href = window.getAssetUrl(`pages/watch.html?title=${encodedTitle}`);
              } else {
                  window.location.href = `/streaming-service/pages/watch.html?title=${encodedTitle}`;
              }
          });
          
          row.appendChild(card);
      }
  });
  
  console.log("Search page carousels populated with content");
}

// Function to set up search input
function setupSearchInput() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (!searchInput || !searchResults) {
      console.error("Search elements not found");
      return;
  }
  
  // Focus the search input when the page loads
  searchInput.focus();
  
  // Handle input events
  searchInput.addEventListener('input', function() {
      if (this.value.length > 0) {
          // Show search results
          searchResults.innerHTML = ''; // Clear previous results
          searchResults.classList.add('visible');
          
          // Generate search result cards
          generateSearchResults(this.value);
      } else {
          // Hide search results when input is empty
          searchResults.classList.remove('visible');
      }
  });
}

// Function to generate search results
function generateSearchResults(query) {
  const searchResults = document.getElementById('search-results');
  
  // Sample content data for search
  const contentData = [
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
      { title: "The Dark Knight", year: "2008", type: "movie", img: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb" }
  ];
  
  // Filter content by query
  const filteredContent = contentData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase())
  );
  
  // If no results, show a message
  if (filteredContent.length === 0) {
      searchResults.innerHTML = '<div class="no-results">No results found</div>';
      return;
  }
  
  // Take up to 12 results (3x4 grid)
  const resultsToShow = filteredContent.slice(0, 12);
  
  // Create result cards
  resultsToShow.forEach(content => {
      const card = document.createElement('div');
      card.className = 'result-card';
      
      card.innerHTML = `
          <img src="${content.img}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="${content.title}">
          <div class="title">${content.title}</div>
      `;
      
      // Add click event handler for cards
      card.addEventListener('click', function() {
          // Navigate to the watch page with the movie title
          const encodedTitle = encodeURIComponent(content.title);
          
          // Use URL normalizer if available
          if (window.getAssetUrl) {
              window.location.href = window.getAssetUrl(`pages/watch.html?title=${encodedTitle}`);
          } else {
              window.location.href = `/streaming-service/pages/watch.html?title=${encodedTitle}`;
          }
      });
      
      searchResults.appendChild(card);
  });
}

// Function to set up content type tabs
function setupContentTypeTabs() {
  const contentTabs = document.querySelectorAll('.content-tab');
  
  contentTabs.forEach(tab => {
      tab.addEventListener('click', function() {
          // Remove active class from all tabs
          contentTabs.forEach(t => t.classList.remove('active'));
          
          // Add active class to clicked tab
          this.classList.add('active');
          
          // In a real app, this would filter content by type
          console.log('Selected content type:', this.dataset.type);
      });
  });
}

// Function to set up genre pills
function setupGenrePills() {
  const genrePills = document.querySelectorAll('.genre-pill');
  
  genrePills.forEach(pill => {
      pill.addEventListener('click', function() {
          // Toggle active class
          this.classList.toggle('active');
          
          // In a real app, this would filter content by genre
          console.log('Toggled genre:', this.textContent);
      });
  });
}
