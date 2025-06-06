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

  // Initialize Telegram App
  initTelegramApp();
  
  // Display user points if available
  displayUserPoints();
});

// Function to set up settings icon
function setupSettingsIcon() {
    const settingsIcon = document.querySelector('.settings-icon');
    
    if (settingsIcon) {
        settingsIcon.addEventListener('click', function() {
            console.log('Settings icon clicked');
            
            // Check if getAssetUrl is available (URL normalizer)
            if (window.getAssetUrl) {
                // Navigate to account settings page using the URL normalizer
                window.location.href = window.getAssetUrl('account-settings.html');
            } else {
                // Fallback to direct link
                window.location.href = 'account-settings.html';
            }
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
          // Get stored follow counts from localStorage
          const storedCounts = getStoredFollowCounts(telegramUser.id);
          
          // Use Telegram user data
          const userData = {
              name: telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : ''),
              username: telegramUser.username || 'No username',
              bio: "Telegram user", // Telegram doesn't provide bio, so use a default
              dvds: 120, // Default value since Telegram doesn't provide this
              followers: storedCounts.followers, // Start with 0 by default from localStorage
              following: storedCounts.following, // Start with 0 by default from localStorage
              profileImage: telegramUser.photo_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330" // Fallback image if no photo
          };
          
          // Update UI with Telegram user data
          document.querySelector('.username').textContent = userData.name;
          document.querySelector('.bio').textContent = userData.bio;
          
          // Only update profile image if Telegram provides one
          if (telegramUser.photo_url) {
              document.querySelector('.profile-image img').src = userData.profileImage;
          }
          
          // Update stats
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
  
  // Get stored follow counts for demo user
  const storedCounts = getStoredFollowCounts('demo_user');
  
  const userData = {
      name: "Evelyn Hawthorne",
      bio: "Movie enthusiast and collector.",
      dvds: 120,
      followers: storedCounts.followers, // Start with 0 by default from localStorage
      following: storedCounts.following, // Start with 0 by default from localStorage
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

// Function to get stored follow counts from localStorage
function getStoredFollowCounts(userId) {
  const key = `user_follow_stats_${userId}`;
  const storedData = localStorage.getItem(key);
  
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error('Error parsing stored follow counts:', e);
    }
  }
  
  // Default to 0 if no data is stored
  return { followers: 0, following: 0 };
}

// Function to update stored follow counts in localStorage
function updateStoredFollowCounts(userId, followers, following) {
  const key = `user_follow_stats_${userId}`;
  const data = { followers, following };
  
  localStorage.setItem(key, JSON.stringify(data));
}

// Function to load collection data
function loadCollectionData() {
  // Get user ID (from Telegram or fallback to demo)
  let userId = 'demo_user';
  
  // Try to get from Telegram
  if (window.Telegram && window.Telegram.WebApp && 
      window.Telegram.WebApp.initDataUnsafe && 
      window.Telegram.WebApp.initDataUnsafe.user) {
      userId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  }
  
  // Key for user's collection in localStorage
  const collectionKey = `user_collection_${userId}`;
  
  // Try to load user's collection from localStorage
  let userCollection = null;
  const storedCollection = localStorage.getItem(collectionKey);
  
  if (storedCollection) {
    try {
      userCollection = JSON.parse(storedCollection);
      console.log('Loaded user collection from localStorage:', userCollection);
    } catch (e) {
      console.error('Error parsing stored collection:', e);
    }
  }
  
  // If we have a user collection with items, use it
  if (userCollection && 
      ((userCollection.movies && userCollection.movies.length > 0) || 
       (userCollection.tvShows && userCollection.tvShows.length > 0))) {
    
    // Populate movies
    if (userCollection.movies && userCollection.movies.length > 0) {
      populateCollectionGrid('movies-grid', userCollection.movies);
    } else {
      // Hide movies section if empty
      const moviesHeaders = document.querySelectorAll('.section-header h3');
      const moviesSection = Array.from(moviesHeaders).find(header => header.textContent.includes('Movies'));
      if (moviesSection) {
        moviesSection.closest('.section-header').parentElement.style.display = 'none';
      }
    }
    
    // Populate TV shows
    if (userCollection.tvShows && userCollection.tvShows.length > 0) {
      populateCollectionGrid('tvshows-grid', userCollection.tvShows);
    } else {
      // Hide TV shows section if empty
      const tvHeaders = document.querySelectorAll('.section-header h3');
      const tvShowsSection = Array.from(tvHeaders).find(header => header.textContent.includes('TV Shows'));
      if (tvShowsSection) {
        tvShowsSection.closest('.section-header').parentElement.style.display = 'none';
      }
    }
    
    // Games section uses sample data for now
    populateCollectionGrid('games-grid', getSampleGames());
    
  } else {
    // Fallback to sample data if no user collection exists
    console.log('No user collection found, using sample data');
    
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
      games: getSampleGames()
    };
    
    // Populate movies
    populateCollectionGrid('movies-grid', collectionData.movies);
    
    // Populate TV shows
    populateCollectionGrid('tvshows-grid', collectionData.tvShows);
    
    // Populate games
    populateCollectionGrid('games-grid', collectionData.games);
  }
}

// Helper function to get sample games
function getSampleGames() {
  return [
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
  ];
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
          const movieTitle = encodeURIComponent(item.title);
          if (window.getAssetUrl) {
              window.location.href = window.getAssetUrl('pages/watch.html') + '?movie=' + movieTitle;
          } else {
              const baseUrl = window.location.origin;
              const repoPath = '/streaming-service'; // GitHub Pages repository name
              window.location.href = `${baseUrl}${repoPath}/pages/watch.html?movie=${movieTitle}`;
          }
      });
      
      grid.appendChild(itemElement);
  });
}

// Function to set up search functionality
function setupSearch() {
  // This function is now handled by account-search.js
  console.log('Search functionality handled by account-search.js');
  
  // Avoid adding any event listeners here that might conflict
  // with the implementation in account-search.js
}

// Function to set up follow button
function setupFollowButton() {
  const followButton = document.querySelector('.follow-button');
  
  if (followButton) {
      // Check if this is the user's own profile
      const isOwnProfile = isCurrentUserProfile();
      
      // Hide the button if it's the user's own profile
      if (isOwnProfile) {
          followButton.style.display = 'none';
      } else {
          // Get profile user ID from URL
          const urlParams = new URLSearchParams(window.location.search);
          const profileUserId = urlParams.get('user_id') || 'demo_profile_user';
          
          // Get current user ID (for tracking who they follow)
          const currentUserId = getCurrentUserId();
          
          // Check if user is already following this profile
          const isFollowing = checkIfFollowing(currentUserId, profileUserId);
          
          // Set initial button state
          if (isFollowing) {
              followButton.textContent = 'Following';
              followButton.style.backgroundColor = '#555';
          }
          
          // Only add event listener if it's not the user's profile
          followButton.addEventListener('click', function() {
              // Toggle follow state
              if (this.textContent === 'Follow') {
                  // User is following this profile
                  this.textContent = 'Following';
                  this.style.backgroundColor = '#555';
                  
                  // Update follower count on profile
                  const followerCount = document.querySelectorAll('.stat-number')[1];
                  let count = parseInt(followerCount.textContent.replace('K', '')) || 0;
                  if (count.toString().includes('.')) {
                      count = parseFloat(count) * 1000;
                  }
                  count += 1;
                  followerCount.textContent = count > 999 ? (count / 1000).toFixed(1) + 'K' : count;
                  
                  // Store that current user is following this profile
                  toggleFollowStatus(currentUserId, profileUserId, true);
                  
                  // Update following count for current user (not visible on this page)
                  const currentUserStats = getStoredFollowCounts(currentUserId);
                  updateStoredFollowCounts(currentUserId, currentUserStats.followers, currentUserStats.following + 1);
                  
                  // Update followers count for profile user
                  const profileUserStats = getStoredFollowCounts(profileUserId);
                  updateStoredFollowCounts(profileUserId, profileUserStats.followers + 1, profileUserStats.following);
              } else {
                  // User is unfollowing this profile
                  this.textContent = 'Follow';
                  this.style.backgroundColor = '#ff6347';
                  
                  // Update follower count
                  const followerCount = document.querySelectorAll('.stat-number')[1];
                  let count = followerCount.textContent;
                  if (count.includes('K')) {
                      count = parseFloat(count.replace('K', '')) * 1000;
                  } else {
                      count = parseInt(count);
                  }
                  count = Math.max(0, count - 1); // Ensure count doesn't go below 0
                  followerCount.textContent = count > 999 ? (count / 1000).toFixed(1) + 'K' : count;
                  
                  // Store that current user is no longer following this profile
                  toggleFollowStatus(currentUserId, profileUserId, false);
                  
                  // Update following count for current user (not visible on this page)
                  const currentUserStats = getStoredFollowCounts(currentUserId);
                  updateStoredFollowCounts(currentUserId, currentUserStats.followers, Math.max(0, currentUserStats.following - 1));
                  
                  // Update followers count for profile user
                  const profileUserStats = getStoredFollowCounts(profileUserId);
                  updateStoredFollowCounts(profileUserId, Math.max(0, profileUserStats.followers - 1), profileUserStats.following);
              }
          });
      }
  }
}

// Function to get current user ID
function getCurrentUserId() {
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
      return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  }
  return 'demo_current_user';
}

// Function to check if a user is following another user
function checkIfFollowing(followerId, followeeId) {
  const key = `following_${followerId}`;
  const following = localStorage.getItem(key);
  
  if (following) {
    try {
      const followingList = JSON.parse(following);
      return followingList.includes(followeeId);
    } catch (e) {
      console.error('Error parsing following list:', e);
    }
  }
  
  return false;
}

// Function to toggle follow status
function toggleFollowStatus(followerId, followeeId, isFollowing) {
  const key = `following_${followerId}`;
  let followingList = [];
  
  // Get existing following list
  const following = localStorage.getItem(key);
  if (following) {
    try {
      followingList = JSON.parse(following);
    } catch (e) {
      console.error('Error parsing following list:', e);
    }
  }
  
  if (isFollowing) {
    // Add to following list if not already there
    if (!followingList.includes(followeeId)) {
      followingList.push(followeeId);
    }
  } else {
    // Remove from following list
    followingList = followingList.filter(id => id !== followeeId);
  }
  
  // Save updated following list
  localStorage.setItem(key, JSON.stringify(followingList));
}

// Function to determine if the current profile belongs to the logged-in user
function isCurrentUserProfile() {
    // Get URL parameters to check if we're viewing someone else's profile
    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get('user_id');
    
    // If there's a user_id parameter and it's different from the current user's ID,
    // then we're viewing someone else's profile
    if (profileUserId) {
        // Get current user's ID (from Telegram or localStorage)
        let currentUserId = null;
        
        // Try to get from Telegram
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            currentUserId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
        }
        
        // If we have both IDs, compare them
        if (currentUserId) {
            return currentUserId === profileUserId;
        }
        
        // If we have a profile user ID but no current user ID, it's not the user's profile
        return false;
    }
    
    // If there's no user_id parameter, we're on the user's own profile
    return true;
}

// Initialize Telegram App
function initTelegramApp() {
    console.log('Initializing Telegram App from account.js');
    
    // Check if we already have the telegramApp global
    if (window.telegramApp) {
        console.log('Telegram App already initialized');
        return;
    }
    
    // Check if Telegram SDK is loaded
    if (typeof TelegramApp === 'function') {
        try {
            window.telegramApp = new TelegramApp();
            console.log('Telegram App initialized successfully');
            
            // Update UI with user data
            if (window.telegramApp.user) {
                updateUserProfileWithTelegramData(window.telegramApp.user);
            }
        } catch (e) {
            console.error('Failed to initialize Telegram App:', e);
        }
    } else {
        console.log('Telegram App constructor not available');
    }
}

// Display user points in the UI
function displayUserPoints() {
    // Check if user has points from Telegram
    if (window.telegramApp && typeof window.telegramApp.getPoints === 'function') {
        const userPoints = window.telegramApp.getPoints();
        
        if (userPoints > 0) {
            // Create or update points display
            let pointsDisplay = document.querySelector('.user-points');
            
            if (!pointsDisplay) {
                pointsDisplay = document.createElement('div');
                pointsDisplay.className = 'user-points';
                pointsDisplay.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
                pointsDisplay.style.color = '#4CAF50';
                pointsDisplay.style.padding = '8px 12px';
                pointsDisplay.style.borderRadius = '20px';
                pointsDisplay.style.fontWeight = 'bold';
                pointsDisplay.style.display = 'flex';
                pointsDisplay.style.alignItems = 'center';
                pointsDisplay.style.marginTop = '10px';
                
                // Add to profile info
                const profileInfoDiv = document.querySelector('.profile-info');
                if (profileInfoDiv) {
                    profileInfoDiv.appendChild(pointsDisplay);
                }
            }
            
            // Update the points display
            pointsDisplay.innerHTML = `<i class="fas fa-coins" style="margin-right: 6px;"></i> ${Math.round(userPoints)} points`;
        }
    }
}

// Update user profile with Telegram data
function updateUserProfileWithTelegramData(user) {
    if (!user) return;
    
    // Update username
    const usernameElement = document.querySelector('.username');
    if (usernameElement && user.first_name) {
        usernameElement.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    }
}