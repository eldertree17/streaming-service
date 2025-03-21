// Account page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp if available
    if (window.Telegram && window.Telegram.WebApp) {
      // Tell Telegram that the Mini App is ready
      window.Telegram.WebApp.ready();
      
      // Optionally expand the Mini App to full height
      window.Telegram.WebApp.expand();
      
      console.log("Telegram WebApp initialized");
  }
  // Load user data
  loadUserData();
  
  // Load collection data
  loadCollectionData();
  
  // Set up search functionality
  setupSearch();
  
  // Set up follow button
  setupFollowButton();

  // Set up settings icon
  setupSettingsIcon();
});

// Function to set up settings icon
function setupSettingsIcon() {
    const settingsIcon = document.querySelector('.settings-icon');
    
    if (settingsIcon) {
        settingsIcon.addEventListener('click', function() {
            // Navigate to account settings page
            window.location.href = 'account-settings.html';
        });
    }
}

// Function to load user data with Telegram integration
function loadUserData() {
  // Check if running inside Telegram Mini App
  if (window.Telegram && window.Telegram.WebApp) {
      console.log("Running inside Telegram Mini App");
      
      // Get user data from Telegram
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      
      if (telegramUser) {
          // Use Telegram user data
          const userData = {
              name: telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : ''),
              username: telegramUser.username || 'No username',
              bio: "Telegram user", // Telegram doesn't provide bio, so use a default
              dvds: 120, // Default value since Telegram doesn't provide this
              followers: 1200, // Default value
              following: 340, // Default value
              profileImage: telegramUser.photo_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330" // Fallback image if no photo
          };
          
          // Update UI with Telegram user data
          document.querySelector('.username').textContent = userData.name;
          document.querySelector('.bio').textContent = userData.bio;
          
          // Only update profile image if Telegram provides one
          if (telegramUser.photo_url) {
              document.querySelector('.profile-image img').src = userData.profileImage;
          }
          
          // Update stats (using default values since Telegram doesn't provide these)
          const statNumbers = document.querySelectorAll('.stat-number');
          statNumbers[0].textContent = userData.dvds;
          statNumbers[1].textContent = userData.followers > 999 ? (userData.followers / 1000).toFixed(1) + 'K' : userData.followers;
          statNumbers[2].textContent = userData.following;
          
          console.log("Loaded Telegram user data:", userData.name);
          return;
      }
  }
  
  // Fallback to demo data if not in Telegram or no user data available
  console.log("Using demo data (not in Telegram or no user data)");
  const userData = {
      name: "Evelyn Hawthorne",
      bio: "Movie enthusiast and collector.",
      dvds: 120,
      followers: 1200,
      following: 340,
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  };
  
  // Update UI with demo user data
  document.querySelector('.username').textContent = userData.name;
  document.querySelector('.bio').textContent = userData.bio;
  document.querySelector('.profile-image img').src = userData.profileImage;
  
  // Update stats
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers[0].textContent = userData.dvds;
  statNumbers[1].textContent = userData.followers > 999 ? (userData.followers / 1000).toFixed(1) + 'K' : userData.followers;
  statNumbers[2].textContent = userData.following;
}

// Function to load collection data
function loadCollectionData() {
  // Sample collection data
  const collectionData = {
      movies: [
          {
              title: "The Matrix",
              rating: 10,
              description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
              image: "https://images.unsplash.com/photo-1558486012-817176f84c6d"
          },
          {
              title: "The Godfather Part II",
              rating: 9.0,
              description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
              image: "https://images.unsplash.com/photo-1581985673473-0784a7a44e39"
          },
          {
              title: "The Social Network",
              rating: 8,
              description: "This love of two tech fishmen, a boxer and a lawyer, is tested when they are caught in a web of deception.",
              image: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a"
          },
          {
              title: "The Silence of the Lambs",
              rating: 4,
              description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
              image: "https://images.unsplash.com/photo-1586165368502-1bad197a6461"
          }
      ],
      tvShows: [
          {
              title: "The Shawshank Redemption",
              rating: 5,
              description: "An organized crime dynasty's aging patriarch transfers control of his clandestine empire to his reluctant son.",
              image: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a"
          },
          {
              title: "Schindler's List",
              rating: 2,
              description: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
              image: "https://images.unsplash.com/photo-1581985673473-0784a7a44e39"
          }
      ],
      games: [
          {
              title: "Assassin's Creed",
              rating: 8,
              description: "An interactive crime mystery where the player must solve a series of interconnected murders.",
              image: "https://images.unsplash.com/photo-1547700055-b61cacebece9"
          },
          {
              title: "The Dark Knight",
              rating: 6,
              description: "The story and plot of a detective who must solve a series of murders in a dystopian city.",
              image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb"
          }
      ]
  };
  
  // Populate movies
  populateCollectionGrid('movies-grid', collectionData.movies);
  
  // Populate TV shows
  populateCollectionGrid('tvshows-grid', collectionData.tvShows);
  
  // Populate games
  populateCollectionGrid('games-grid', collectionData.games);
}

// Function to populate a collection grid
function populateCollectionGrid(gridId, items) {
  const grid = document.getElementById(gridId);
  
  // Clear existing content
  grid.innerHTML = '';
  
  // Add items to grid
  items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'collection-item';
      
      // Convert rating to likes format with thumbs up icon
      const likesDisplay = typeof item.rating === 'number' 
          ? `<i class="fas fa-thumbs-up"></i> ${item.rating}` 
          : item.rating;
      
      itemElement.innerHTML = `
          <img src="${item.image}" alt="${item.title}">
          <div class="item-info">
              <div class="item-title-row">
                  <h4 class="item-title">${item.title}</h4>
                  <div class="item-rating">${likesDisplay}</div>
              </div>
              <p class="item-description">${item.description}</p>
          </div>
      `;
      
      // Add click event to navigate to watch page
      itemElement.addEventListener('click', function() {
          window.location.href = `watch.html?movie=${encodeURIComponent(item.title)}`;
      });
      
      grid.appendChild(itemElement);
  });
}

// Function to set up search functionality
function setupSearch() {
  const searchInput = document.querySelector('.search-field input');
  
  if (searchInput) {
      searchInput.addEventListener('focus', function() {
          // In a real app, this would navigate to a search page
          console.log('Search focused - would navigate to search page');
          // window.location.href = 'search.html';
      });
  }
}

// Function to set up follow button
function setupFollowButton() {
  const followButton = document.querySelector('.follow-button');
  
  if (followButton) {
      followButton.addEventListener('click', function() {
          // Toggle follow state
          if (this.textContent === 'Follow') {
              this.textContent = 'Following';
              this.style.backgroundColor = '#555';
              
              // Update follower count (in a real app, this would call an API)
              const followerCount = document.querySelectorAll('.stat-number')[1];
              let count = parseInt(followerCount.textContent.replace('K', '')) * 1000;
              count += 1;
              followerCount.textContent = (count / 1000).toFixed(1) + 'K';
          } else {
              this.textContent = 'Follow';
              this.style.backgroundColor = '#ff6347';
              
              // Update follower count
              const followerCount = document.querySelectorAll('.stat-number')[1];
              let count = parseFloat(followerCount.textContent.replace('K', '')) * 1000;
              count -= 1;
              followerCount.textContent = (count / 1000).toFixed(1) + 'K';
          }
      });
  }
}