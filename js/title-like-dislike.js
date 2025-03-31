/**
 * title-like-dislike.js - Functionality for the title actions (like/dislike buttons)
 *
 * Handles all like/dislike related functionality including:
 * - Setting up event listeners for like/dislike buttons
 * - Managing active states for the buttons
 * - API calls for like/dislike actions
 * - Fallback behavior when API is not available
 * - Updating UI counts
 */

// Initialize title actions when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing title-like-dislike module');
    setupTitleActions();
});

/**
 * Function to set up title like/dislike buttons
 */
function setupTitleActions() {
  const likeBtn = document.querySelector('.title-like-btn');
  const dislikeBtn = document.querySelector('.title-dislike-btn');

  if (likeBtn) {
    // Remove existing event listeners
    const newLikeBtn = likeBtn.cloneNode(true);
    likeBtn.parentNode.replaceChild(newLikeBtn, likeBtn);
    
    // Get content ID
    const contentId = newLikeBtn.dataset.contentId;
    
    // Initialize like count to 0
    const countElement = newLikeBtn.querySelector('.like-count');
    if (countElement) {
      countElement.textContent = '0';
    }
    
    // Check localStorage for existing like state
    if (contentId) {
      const likeState = localStorage.getItem(`like_${contentId}`);
      if (likeState === 'true') {
        newLikeBtn.classList.add('active');
        if (countElement) {
          countElement.textContent = '1';
        }
      }
    }
    
    newLikeBtn.addEventListener('click', async function() {
      const contentId = this.dataset.contentId;
      
      if (!contentId) {
        console.warn('No content ID available for like action');
        return;
      }
      
      try {
        // Check if button is already active (already liked)
        const isActive = this.classList.contains('active');
        
        // Always check if dislike is active and remove it when clicking like
        if (dislikeBtn && dislikeBtn.classList.contains('active')) {
          console.log('Removing active dislike when liking');
          dislikeBtn.classList.remove('active');
          localStorage.removeItem(`dislike_${contentId}`);
        }
        
        // Call the API to increment or decrement like count
        const response = await likeContent(contentId, isActive);
        
        // Update the UI with the new count
        if (response && response.likes !== undefined) {
          const countElement = this.querySelector('.like-count');
          if (countElement) {
            // Update with the new count
            countElement.textContent = isActive ? '0' : '1';
          }
          
          // Toggle active class and update localStorage
          if (isActive) {
            this.classList.remove('active');
            localStorage.removeItem(`like_${contentId}`);
          } else {
            this.classList.add('active');
            localStorage.setItem(`like_${contentId}`, 'true');
          }
          
          console.log('Content like action successful:', response);
        }
      } catch (error) {
        console.error('Error with like action:', error);
      }
    });
  }
  
  if (dislikeBtn) {
    // Remove existing event listeners
    const newDislikeBtn = dislikeBtn.cloneNode(true);
    dislikeBtn.parentNode.replaceChild(newDislikeBtn, dislikeBtn);
    
    newDislikeBtn.addEventListener('click', async function() {
      const contentId = this.dataset.contentId;
      
      if (!contentId) {
        console.warn('No content ID available for dislike action');
        return;
      }
      
      try {
        // Check if button is already active (already disliked)
        const isActive = this.classList.contains('active');
        
        // Always check if like is active and remove it when clicking dislike
        const likeBtn = document.querySelector('.title-like-btn');
        if (likeBtn && likeBtn.classList.contains('active')) {
          console.log('Removing active like when disliking');
          likeBtn.classList.remove('active');
          
          // Update like count if necessary
            const likeCountElement = likeBtn.querySelector('.like-count');
            if (likeCountElement) {
            // Get current count and reduce by 1 if we're activating dislike
            const currentText = likeCountElement.textContent;
            const currentCount = parseInt(currentText.replace(/[KMB]/g, ''), 10) || 0;
            const newCount = Math.max(0, currentCount - 1);
            
            likeCountElement.textContent = newCount >= 1000 ? 
              formatNumberWithSuffix(newCount) : 
              newCount.toString();
          }
        }
        
        // Call the API to toggle dislike status
        const response = await dislikeContent(contentId, isActive);
        
        // Toggle active class
        if (isActive) {
          this.classList.remove('active');
        } else {
            this.classList.add('active');
          }
        
        console.log('Content dislike action successful:', response);
        } catch (error) {
        console.error('Error with dislike action:', error);
        // Don't alert, just log to console for better UX
      }
    });
  }
}

/**
 * Function to like content by calling the API
 * @param {string} contentId - The ID of the content to like
 * @param {boolean} isUnlike - Whether this is an unlike action
 * @returns {Promise<Object>} The response with updated like counts
 */
async function likeContent(contentId, isUnlike = false) {
  console.log(`${isUnlike ? 'Unlike' : 'Like'} action for content: ${contentId}`);
  
  // Get current like count from UI
  const likeBtn = document.querySelector('.title-like-btn');
  const countElement = likeBtn?.querySelector('.like-count');
  let currentCount = 0;
  
  if (countElement) {
    // Remove any formatting (K, M, B) and parse to int
    const countText = countElement.textContent.replace(/[KMB]/g, '');
    currentCount = parseInt(countText, 10) || 0;
  }
  
  try {
    const method = isUnlike ? 'DELETE' : 'POST';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
    
    // First, check if API might be available without making a request
    // This prevents showing CORS errors in the console
    if (window.location.hostname !== 'localhost' || 
        !contentId.startsWith('sample')) {
      
      try {
        const response = await fetch(`http://localhost:5003/api/content/${contentId}/like`, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'no-cors', // Prevent CORS errors in the console
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Failed to update like status');
        }
        
        return await response.json();
      } catch (fetchError) {
        // Silently fail and use fallback
        console.log('Using local fallback for like action');
        }
      } else {
      console.log('Detected demo environment, using local fallback');
    }
    
    // Fallback handling for when API is unavailable
    // When we're liking, make sure dislike is removed from UI as well
    if (!isUnlike) {
      const dislikeBtn = document.querySelector('.title-dislike-btn');
      if (dislikeBtn && dislikeBtn.classList.contains('active')) {
        dislikeBtn.classList.remove('active');
      }
    }
    
    return {
      likes: isUnlike ? Math.max(0, currentCount - 1) : currentCount + 1,
      dislikes: 0
    };
  } catch (error) {
    console.log('Using fallback for like action');
    
    // Fallback handling for when API is unavailable
    return {
      likes: isUnlike ? Math.max(0, currentCount - 1) : currentCount + 1,
      dislikes: 0
    };
  }
}

/**
 * Function to dislike content by calling the API
 * @param {string} contentId - The ID of the content to dislike
 * @param {boolean} isUndislike - Whether this is an undislike action
 * @returns {Promise<Object>} The response with updated dislike counts
 */
async function dislikeContent(contentId, isUndislike = false) {
  console.log(`${isUndislike ? 'Undislike' : 'Dislike'} action for content: ${contentId}`);
  
  // Get current like count from UI for potential update
  const likeBtn = document.querySelector('.title-like-btn');
  const countElement = likeBtn?.querySelector('.like-count');
  let currentLikes = 0;
  
  if (countElement) {
    // Remove any formatting (K, M, B) and parse to int
    const countText = countElement.textContent.replace(/[KMB]/g, '');
    currentLikes = parseInt(countText, 10) || 0;
  }
  
  // Determine if the like button is active
  const likeActive = likeBtn?.classList.contains('active');
  
  try {
    const method = isUndislike ? 'DELETE' : 'POST';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
    
    // First, check if API might be available without making a request
    // This prevents showing CORS errors in the console
    if (window.location.hostname !== 'localhost' || 
        !contentId.startsWith('sample')) {
      
      try {
        const response = await fetch(`http://localhost:5003/api/content/${contentId}/dislike`, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'no-cors', // Prevent CORS errors in the console
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Failed to update dislike status');
        }
        
        return await response.json();
      } catch (fetchError) {
        // Silently fail and use fallback
        console.log('Using local fallback for dislike action');
      }
        } else {
      console.log('Detected demo environment, using local fallback');
    }
    
    // Fallback handling for when API is unavailable
    // When we're disliking, make sure like is removed from UI as well
    if (!isUndislike && likeActive) {
          likeBtn.classList.remove('active');
    }
    
    return {
      likes: likeActive ? Math.max(0, currentLikes - 1) : currentLikes,
      dislikes: 0 // We don't display dislike count in UI
    };
  } catch (error) {
    console.log('Using fallback for dislike action');
    
    // Simulate API response - when disliking we reduce likes if user previously liked
    return {
      likes: likeActive ? Math.max(0, currentLikes - 1) : currentLikes,
      dislikes: 0 // We don't display dislike count in UI
    };
  }
}

/**
 * Format a number with K, M, B suffix
 * @param {number} number - The number to format
 * @returns {string} Formatted number with suffix (e.g., 1.2K, 3.4M)
 */
function formatNumberWithSuffix(number) {
  if (number === null || number === undefined) return '0';
  
  // Convert to number if it's a string
  const num = typeof number === 'string' ? parseInt(number, 10) : number;
  
  if (isNaN(num)) return '0';
  
  // Format based on magnitude
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// Export functions for use in other modules
window.TitleActions = {
  setupTitleActions,
  likeContent,
  dislikeContent,
  formatNumberWithSuffix
}; 