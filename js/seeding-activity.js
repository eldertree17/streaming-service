// DVD Seeding page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp if available
    initTelegramWebApp();
    
    // Set up back button
    setupBackButton();
    
    // Set up dropdown functionality
    setupDropdowns();
    
    // Set up action buttons
    setupActionButtons();
});

// Function to initialize Telegram WebApp
function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        // Tell Telegram that the Mini App is ready
        window.Telegram.WebApp.ready();
        
        // Optionally expand the Mini App to full height
        window.Telegram.WebApp.expand();
        
        console.log("Telegram WebApp initialized in DVD Seeding page");
    }
}

// Function to set up back button
function setupBackButton() {
    const backButton = document.getElementById('back-button');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Navigate back to activity page
            window.location.href = 'activity.html';
        });
    }
}

// Function to set up dropdown functionality
function setupDropdowns() {
  // Get all dropdowns (both info and FAQ)
  const dropdownHeaders = document.querySelectorAll('.dropdown-header');
  
  dropdownHeaders.forEach(header => {
      const content = header.nextElementSibling;
      const icon = header.querySelector('i');
      
      // Initially hide all dropdown content
      if (content) {
          content.style.display = 'none';
      }
      
      header.addEventListener('click', function() {
          // Toggle dropdown content
          if (content.style.display === 'none') {
              content.style.display = 'block';
              if (icon) icon.className = 'fas fa-chevron-up';
          } else {
              content.style.display = 'none';
              if (icon) icon.className = 'fas fa-chevron-down';
          }
      });
  });
}

// Function to set up action buttons
function setupActionButtons() {
  // Claim button
  const claimButton = document.querySelector('.claim-button');
  if (claimButton) {
      claimButton.addEventListener('click', function() {
          console.log('Claim button clicked');
          
          // Get the unclaimed earnings amount (should be $500)
          const unclaimedBox = document.querySelectorAll('.earnings-box')[0];
          const unclaimedAmount = unclaimedBox.querySelector('.earnings-amount');
          
          // Get the total earnings amount (should be $1,234.56)
          const totalBox = document.querySelectorAll('.earnings-box')[1];
          const totalAmount = totalBox.querySelector('.earnings-amount');
          
          if (unclaimedAmount && totalAmount) {
              // Extract the numeric values
              const unclaimedValue = 500; // Hardcoded for reliability
              const totalValue = 1234.56; // Hardcoded for reliability
              
              // Calculate new total
              const newTotal = totalValue + unclaimedValue;
              
              // Update the displays
              unclaimedAmount.textContent = '$0';
              totalAmount.textContent = '$' + newTotal.toFixed(2); // Should be $1,734.56
              
              // Create and add the subtitle showing the amount just claimed
              const claimedSubtitle = document.createElement('div');
              claimedSubtitle.className = 'claimed-subtitle';
              claimedSubtitle.textContent = '+$' + unclaimedValue.toFixed(2) + ' just claimed';
              
              // Check if subtitle already exists and remove it
              const existingSubtitle = totalBox.querySelector('.claimed-subtitle');
              if (existingSubtitle) {
                  existingSubtitle.remove();
              }
              
              // Insert the subtitle after the total amount
              totalAmount.insertAdjacentElement('afterend', claimedSubtitle);
              
              console.log('Updated total earnings to: $' + newTotal.toFixed(2));
          }
          
          // Change button color to green and update text
          this.style.backgroundColor = '#28a745';
          this.textContent = 'Claimed';
          
          // Disable the button
          this.disabled = true;
          
          // Optional: Show a success message
          alert('Rewards claimed successfully! $500 added to your total earnings.');
      });
  }
  
  // Withdraw button
  const withdrawButton = document.querySelector('.withdraw-button');
  if (withdrawButton) {
      withdrawButton.addEventListener('click', function() {
          console.log('Withdraw button clicked');
          
          // Get the earnings amount element
          const earningsAmount = this.parentElement.querySelector('.earnings-amount');
          
          // Update the earnings amount to $0
          if (earningsAmount) {
              earningsAmount.textContent = '$0';
          }
          
          // Remove the claimed subtitle if it exists
          const totalBox = document.querySelectorAll('.earnings-box')[1];
          const existingSubtitle = totalBox.querySelector('.claimed-subtitle');
          if (existingSubtitle) {
              existingSubtitle.remove();
          }
          
          // Change button color to green and update text
          this.style.backgroundColor = '#28a745';
          this.textContent = 'Withdrawn';
          
          // Disable the button
          this.disabled = true;
          
          // Show a success message
          alert('Funds withdrawn successfully!');
      });
  }
  
  // Movie cards
  const movieCards = document.querySelectorAll('.movie-card');
  movieCards.forEach(card => {
      card.addEventListener('click', function() {
          const movieTitle = this.querySelector('.movie-title').textContent;
          console.log('Selected movie:', movieTitle);
          // In a real app, this would navigate to the movie detail page
          // window.location.href = `movie.html?title=${encodeURIComponent(movieTitle)}`;
      });
  });
}