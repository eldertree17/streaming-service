// Activity page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Telegram WebApp if available
  initTelegramWebApp();
  
  // Set up section click handlers
  setupSectionHandlers();
  
  // Load user activity data
  loadActivityData();
});

// Function to initialize Telegram WebApp
function initTelegramWebApp() {
  if (window.Telegram && window.Telegram.WebApp) {
      // Tell Telegram that the Mini App is ready
      window.Telegram.WebApp.ready();
      
      // Optionally expand the Mini App to full height
      window.Telegram.WebApp.expand();
      
      console.log("Telegram WebApp initialized in Activity page");
  }
}

// Function to set up section click handlers
function setupSectionHandlers() {
  // DVD Seeding section click handler
  const dvdSeedingHeader = document.querySelector('.dvd-seeding-section .section-header');
  if (dvdSeedingHeader) {
      dvdSeedingHeader.addEventListener('click', function() {
          console.log('DVD Seeding section clicked');
          // Navigate to the DVD Seeding page
          window.location.href = 'seeding-activity.html';
      });
  }
  
  // Roadmap section click handler
  const roadmapHeader = document.querySelector('.roadmap-section .section-header');
  if (roadmapHeader) {
      roadmapHeader.addEventListener('click', function() {
          console.log('Roadmap section clicked');
          // In a real app, this would navigate to a detailed roadmap page
          // window.location.href = 'roadmap.html';
      });
  }
}

// Function to load user activity data
function loadActivityData() {
  // In a real app, this would fetch data from an API
  // For demo, we'll use static data that matches the HTML
  
  const activityData = {
      dvdSeeding: {
          dvdsSeeded: 500,
          apy: '10%',
          earnings: '$50',
          duration: 'Flexible ~ 1 Year',
          totalEarnings: '$250',
          totalPercentage: '+10%',
          projectedEarnings: '$300',
          projectedPercentage: '+20%'
      },
      roadmap: [
          {
              quarter: 'Q1 2023',
              description: 'Launch first library.',
              icon: 'gift'
          },
          {
              quarter: 'Q2 2023',
              description: 'Enable premier league.',
              icon: 'crown'
          },
          {
              quarter: 'Q3 2023',
              description: 'Review and assessment of outcomes.',
              icon: 'chart-line'
          }
      ]
  };
  
  // Update DVD Seeding section with data
  updateDvdSeedingSection(activityData.dvdSeeding);
  
  // Update Roadmap section with data
  updateRoadmapSection(activityData.roadmap);
}

// Function to update DVD Seeding section with data
function updateDvdSeedingSection(data) {
  // Update stats
  const statValues = document.querySelectorAll('.stat-value');
  if (statValues.length >= 4) {
      statValues[0].textContent = data.dvdsSeeded;
      statValues[1].textContent = data.apy;
      statValues[2].textContent = data.earnings;
      statValues[3].textContent = data.duration;
  }
  
  // Update earnings summary
  const earningsValues = document.querySelectorAll('.earnings-value');
  if (earningsValues.length >= 2) {
      earningsValues[0].innerHTML = `${data.totalEarnings} <span class="percentage">${data.totalPercentage}</span>`;
      earningsValues[1].innerHTML = `${data.projectedEarnings} <span class="percentage">${data.projectedPercentage}</span>`;
  }
}

// Function to update Roadmap section with data
function updateRoadmapSection(data) {
  // In a real app, you might dynamically generate the timeline items
  // For this demo, we're just ensuring the HTML matches the data
  console.log('Roadmap data loaded:', data.length, 'items');
}