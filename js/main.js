// Function to set up movie item clicks - define this OUTSIDE any event handlers
function setupMovieItemClicks() {
    // Select all clickable movie elements - adjust selectors to match your HTML
    const movieItems = document.querySelectorAll('.content-card, .featured-card');
    
    movieItems.forEach(item => {
      item.addEventListener('click', function(e) {
        // Don't navigate if clicking on the like button
        if (e.target.closest('.likes')) {
          e.stopPropagation();
          return;
        }
        
        // Get movie title from the card
        const titleElement = this.querySelector('p, h2, .title-container h2, .card-info p');
        let movieTitle = 'Inception'; // Default fallback
        
        if (titleElement) {
          movieTitle = titleElement.textContent.trim();
          console.log('Clicked on movie:', movieTitle);
          
          // Navigate to the watch page with the movie title as a parameter
          window.location.href = 'pages/watch.html?movie=' + encodeURIComponent(movieTitle);
        }
      });
    });
    
    console.log('Movie click handlers set up for', movieItems.length, 'items');
  }
  
  // Add interactivity to the Netflix-like interface
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp if available
    if (window.Telegram && window.Telegram.WebApp) {
        // Tell Telegram that the Mini App is ready
        window.Telegram.WebApp.ready();
        
        // Optionally expand the Mini App to full height
        window.Telegram.WebApp.expand();
        
        console.log("Telegram WebApp initialized");
    }
      // Update hero content first with random featured content
      updateHeroContent();
      
      // Generate category sections
      generateCategorySections();
      
      // Then populate carousels
      populateCarousels();
  
      // Add this line at the end of your initialization
      setupMovieItemClicks();
      
      // Navigation bar functionality
      const navItems = document.querySelectorAll('.nav-item');
      
      navItems.forEach(item => {
          item.addEventListener('click', function() {
              // Remove active class from all items
              navItems.forEach(nav => nav.classList.remove('active'));
              
              // Add active class to clicked item
              this.classList.add('active');
          });
      });
      
      // Like button functionality
      const likeButton = document.querySelector('.likes');
      let likeCount = Math.floor(Math.random() * 30) + 10; // Random likes between 10-40
  
      if (likeButton) {
          // Update the initial text
          likeButton.innerHTML = `<i class="fas fa-thumbs-up"></i> ${likeCount}`;
          
          likeButton.addEventListener('click', function(e) {
              // Stop event propagation to prevent navigation
              e.stopPropagation();
              
              if (!this.classList.contains('active')) {
                  // Increment like count when clicked
                  likeCount++;
                  this.innerHTML = `<i class="fas fa-thumbs-up"></i> ${likeCount}`;
                  this.classList.add('active');
              } else {
                  // Decrement if clicked again (unlike)
                  likeCount--;
                  this.innerHTML = `<i class="fas fa-thumbs-up"></i> ${likeCount}`;
                  this.classList.remove('active');
              }
          });
      }
  
      // Search functionality
      const searchInput = document.querySelector('.search-field input');
      
      if (searchInput) {
          searchInput.addEventListener('keyup', function(e) {
              if (e.key === 'Enter') {
                  console.log('Searching for:', this.value);
                  // In a real app, this would perform a search
              }
          });
      }
      
      // Voice search functionality
      const voiceIcon = document.querySelector('.voice-icon');
      
      if (voiceIcon) {
          voiceIcon.addEventListener('click', function() {
              console.log('Voice search activated');
              // In a real app, this would activate voice search
          });
      }
      
      // Set up search navigation
      setupSearchNavigation();
  });
  
  // Function to update hero content with random featured content
  function updateHeroContent() {
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
  
  // Function to populate carousels with 15 movies each
  function populateCarousels() {
      // Sample movie and TV show data with better images
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
              window.location.href = 'pages/search.html';
          });
          
          // Also make the icons inside the search field clickable
          const searchIcon = searchTrigger.querySelector('.fa-search');
          const voiceIcon = searchTrigger.querySelector('.fa-microphone');
          const searchInput = searchTrigger.querySelector('input');
          
          if (searchIcon) {
              searchIcon.addEventListener('click', function(e) {
                  e.stopPropagation(); // Prevent double triggering
                  window.location.href = 'pages/search.html';
              });
          }
          
          if (voiceIcon) {
              voiceIcon.addEventListener('click', function(e) {
                  e.stopPropagation(); // Prevent double triggering
                  window.location.href = 'pages/search.html';
              });
          }
          
          if (searchInput) {
              searchInput.addEventListener('click', function(e) {
                  e.stopPropagation(); // Prevent double triggering
                  window.location.href = 'pages/search.html';
              });
              
              // Also trigger on focus attempt
              searchInput.addEventListener('focus', function(e) {
                  window.location.href = 'pages/search.html';
              });
          }
      }
  }