/**
 * cast.js - Functionality for the cast section
 *
 * Handles all cast-related functionality including:
 * - Populating the cast carousel
 * - Populating the cast modal
 * - Displaying cast information
 */

// Initialize cast functionality when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing cast module');
    populateCastCarousel();
    
    // Set up event listener for the "See All" button
    const seeAllButton = document.querySelector('.cast-section .see-all-btn');
    if (seeAllButton) {
        seeAllButton.addEventListener('click', function() {
            console.log('Cast "See All" button clicked, re-populating modal');
            // Get the cast data again and populate the modal directly
            const castData = getCastData();
            populateCastModal(castData);
        });
    }
});

/**
 * Function to get the cast data
 * @returns {Array} Array of cast member data objects
 */
function getCastData() {
    // In a real app, this would fetch data from an API
    // For demo, we'll use mock data
    return [
        {
            name: "Leonardo DiCaprio",
            role: "Cobb",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
        },
        {
            name: "Joseph Gordon-Levitt",
            role: "Arthur",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
        },
        {
            name: "Ellen Page",
            role: "Ariadne",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
        },
        {
            name: "Tom Hardy",
            role: "Eames",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
        },
        {
            name: "Ken Watanabe",
            role: "Saito",
            image: "https://images.unsplash.com/photo-1504257432389-52ab5629fba3"
        },
        {
            name: "Michael Caine",
            role: "Miles",
            image: "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f"
        }
    ];
}

/**
 * Function to populate cast carousel
 */
function populateCastCarousel() {
  const castCarousel = document.querySelector('.cast-carousel');
  
  if (!castCarousel) {
    console.warn('Cast carousel element not found');
    return;
  }
  
  // Clear existing content
  castCarousel.innerHTML = '';
  
  // Get cast data
  const castData = getCastData();
  
  // Populate cast carousel
  castData.forEach(cast => {
    const castItem = document.createElement('div');
    castItem.className = 'cast-item';
    
    castItem.innerHTML = `
      <div class="cast-image">
        <img src="${cast.image}" alt="${cast.name}">
      </div>
      <div class="cast-info">
        <div class="cast-name">${cast.name}</div>
        <div class="cast-role">${cast.role}</div>
      </div>
    `;
    
    castCarousel.appendChild(castItem);
  });
  
  // Also populate the cast modal if it exists
  populateCastModal(castData);
}

/**
 * Function to populate the cast modal
 * @param {Array} castData - Array of cast members data
 */
function populateCastModal(castData) {
  const castGrid = document.querySelector('.cast-grid');
  
  if (!castGrid) {
    console.warn('Cast grid element not found');
    return;
  }
  
  // Clear existing content
  castGrid.innerHTML = '';
  
  // Populate cast grid in the modal
  castData.forEach(cast => {
    // Use the same cast-item class that already has styling in the CSS
    const castItem = document.createElement('div');
    castItem.className = 'cast-item';
    
    // Simplify the HTML structure to match what's in the CSS
    castItem.innerHTML = `
      <img src="${cast.image}" alt="${cast.name}">
      <div class="cast-name">${cast.name}</div>
      <div class="cast-role">${cast.role}</div>
    `;
    
    castGrid.appendChild(castItem);
  });
}

// Export functions for use in other modules
window.CastModule = {
  populateCastCarousel,
  populateCastModal,
  getCastData
}; 