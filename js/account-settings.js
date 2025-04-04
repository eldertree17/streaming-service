// Account Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Telegram WebApp if available
  initTelegramWebApp();
  
  // Set up back button
  setupBackButton();
  
  // Set up toggle switches
  setupToggleSwitches();
  
  // Set up sliders
  setupSliders();
  
  // Set up clickable items
  setupClickableItems();
  
  // Set up buttons
  setupButtons();
});

// Function to initialize Telegram WebApp
function initTelegramWebApp() {
  if (window.Telegram && window.Telegram.WebApp) {
      // Tell Telegram that the Mini App is ready
      window.Telegram.WebApp.ready();
      
      // Optionally expand the Mini App to full height
      window.Telegram.WebApp.expand();
      
      console.log("Telegram WebApp initialized in Account Settings page");
  }
}

// Function to set up back button
function setupBackButton() {
  const backButton = document.getElementById('back-button');
  
  if (backButton) {
      backButton.addEventListener('click', function() {
          // Navigate back to account page
          window.location.href = 'account.html';
      });
  }
}

// Function to set up toggle switches
function setupToggleSwitches() {
  // Auto-claim toggle
  const autoClaimToggle = document.getElementById('auto-claim-toggle');
  const autoClaimThreshold = document.querySelector('.auto-claim-threshold');
  const thresholdSlider = document.querySelector('.threshold-slider');
  
  if (autoClaimToggle && autoClaimThreshold && thresholdSlider) {
      autoClaimToggle.addEventListener('change', function() {
          if (this.checked) {
              autoClaimThreshold.style.display = 'flex';
              thresholdSlider.style.display = 'block';
          } else {
              autoClaimThreshold.style.display = 'none';
              thresholdSlider.style.display = 'none';
          }
      });
  }
  
  // Other toggles can be set up here as needed
  const notificationsToggle = document.getElementById('notifications-toggle');
  if (notificationsToggle) {
      notificationsToggle.addEventListener('change', function() {
          console.log('Notifications ' + (this.checked ? 'enabled' : 'disabled'));
          // In a real app, you would save this preference to the user's account
      });
  }
  
  const autoSeedToggle = document.getElementById('auto-seed-toggle');
  if (autoSeedToggle) {
      autoSeedToggle.addEventListener('change', function() {
          console.log('Auto-seed ' + (this.checked ? 'enabled' : 'disabled'));
          // In a real app, you would save this preference to the user's account
      });
  }
  
  const twofaToggle = document.getElementById('twofa-toggle');
  if (twofaToggle) {
      twofaToggle.addEventListener('change', function() {
          if (this.checked) {
              // In a real app, you would start the 2FA setup process
              alert('Two-factor authentication setup wizard would start here');
          } else {
              if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
                  console.log('Two-factor authentication disabled');
              } else {
                  // Revert the toggle if the user cancels
                  this.checked = true;
              }
          }
      });
  }
  
  const biometricToggle = document.getElementById('biometric-toggle');
  if (biometricToggle) {
      biometricToggle.addEventListener('change', function() {
          console.log('Biometric login ' + (this.checked ? 'enabled' : 'disabled'));
          // In a real app, you would save this preference and potentially test biometric capability
      });
  }
  
  const autoplayToggle = document.getElementById('autoplay-toggle');
  if (autoplayToggle) {
      autoplayToggle.addEventListener('change', function() {
          console.log('Auto-play ' + (this.checked ? 'enabled' : 'disabled'));
          // In a real app, you would save this preference to the user's account
      });
  }
}

// Function to set up sliders
function setupSliders() {
  // Storage slider
  const storageSlider = document.getElementById('storage-slider');
  const storageValue = document.querySelector('.setting-item:nth-of-type(2) .setting-value');
  
  if (storageSlider && storageValue) {
      storageSlider.addEventListener('input', function() {
          storageValue.textContent = this.value + 'GB';
      });
  }
  
  // Bandwidth slider
  const bandwidthSlider = document.getElementById('bandwidth-slider');
  const bandwidthValue = document.querySelector('.setting-item:nth-of-type(4) .setting-value');
  
  if (bandwidthSlider && bandwidthValue) {
      bandwidthSlider.addEventListener('input', function() {
          if (this.value == 100) {
              bandwidthValue.textContent = 'Unlimited';
          } else {
              bandwidthValue.textContent = this.value + 'Mbps';
          }
      });
  }
  
  // Threshold slider
  const thresholdSlider = document.getElementById('threshold-slider');
  const thresholdValue = document.querySelector('.auto-claim-threshold .setting-value');
  
  if (thresholdSlider && thresholdValue) {
      thresholdSlider.addEventListener('input', function() {
          thresholdValue.textContent = '$' + this.value;
      });
  }
}

// Function to set up clickable items
function setupClickableItems() {
  const clickableItems = document.querySelectorAll('.setting-item.clickable');
  
  clickableItems.forEach(item => {
      item.addEventListener('click', function() {
          const label = this.querySelector('.setting-label').textContent;
          console.log('Clicked on:', label);
          
          // Handle specific items
          switch(label) {
              case 'Billing history':
                  // Navigate to billing history page
                  // window.location.href = 'billing-history.html';
                  alert('Navigating to Billing History...');
                  break;
              case 'Transaction history':
                  // Navigate to transaction history page
                  // window.location.href = 'transaction-history.html';
                  alert('Navigating to Transaction History...');
                  break;
              case 'Privacy controls':
                  // Navigate to privacy controls page
                  // window.location.href = 'privacy-controls.html';
                  alert('Navigating to Privacy Controls...');
                  break;
              case 'Data sharing preferences':
                  alert('Navigating to Data Sharing Preferences...');
                  break;
              case 'Theme':
                  showThemeOptions();
                  break;
              case 'Language':
                  showLanguageOptions();
                  break;
              case 'Video playback quality':
                  showVideoQualityOptions();
                  break;
              case 'Download quality':
                  showDownloadQualityOptions();
                  break;
              case 'FAQ':
                  // window.location.href = 'faq.html';
                  alert('Navigating to FAQ...');
                  break;
              case 'Contact support':
                  // window.location.href = 'support.html';
                  alert('Navigating to Support...');
                  break;
              case 'Report an issue':
                  // window.location.href = 'report-issue.html';
                  alert('Navigating to Report Issue...');
                  break;
              case 'Terms of service':
                  // window.location.href = 'terms.html';
                  alert('Navigating to Terms of Service...');
                  break;
              case 'Privacy policy':
                  // window.location.href = 'privacy.html';
                  alert('Navigating to Privacy Policy...');
                  break;
              case 'Copyright information':
                  // window.location.href = 'copyright.html';
                  alert('Navigating to Copyright Information...');
                  break;
              default:
                  // For other items, show a placeholder alert
                  alert('This would navigate to ' + label + ' settings');
          }
      });
  });
}

// Function to show theme options
function showThemeOptions() {
  const themes = ['System Default', 'Dark', 'Light'];
  const selectedTheme = prompt('Select theme:\n1. System Default\n2. Dark\n3. Light', 'Dark');
  
  if (selectedTheme && themes.includes(selectedTheme)) {
      // Update the theme value in the UI
      document.querySelector('.setting-item:has(.setting-label:contains("Theme")) .setting-value').textContent = selectedTheme;
      handleThemeChange(selectedTheme);
  }
}

// Function to show language options
function showLanguageOptions() {
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  const selectedLanguage = prompt('Select language:\n' + languages.map((lang, i) => `${i+1}. ${lang}`).join('\n'), 'English');
  
  if (selectedLanguage && languages.includes(selectedLanguage)) {
      // Update the language value in the UI
      document.querySelector('.setting-item:has(.setting-label:contains("Language")) .setting-value').textContent = selectedLanguage;
      handleLanguageChange(selectedLanguage);
  }
}

// Function to show video quality options
function showVideoQualityOptions() {
  const qualities = ['Auto', 'Low', 'Medium', 'High', '4K'];
  const selectedQuality = prompt('Select video playback quality:\n' + qualities.map((q, i) => `${i+1}. ${q}`).join('\n'), 'Auto');
  
  if (selectedQuality && qualities.includes(selectedQuality)) {
      // Update the quality value in the UI
      document.querySelector('.setting-item:has(.setting-label:contains("Video playback quality")) .setting-value').textContent = selectedQuality;
  }
}

// Function to show download quality options
function showDownloadQualityOptions() {
  const qualities = ['Low', 'Medium', 'High'];
  const selectedQuality = prompt('Select download quality:\n' + qualities.map((q, i) => `${i+1}. ${q}`).join('\n'), 'High');
  
  if (selectedQuality && qualities.includes(selectedQuality)) {
      // Update the quality value in the UI
      document.querySelector('.setting-item:has(.setting-label:contains("Download quality")) .setting-value').textContent = selectedQuality;
  }
}

// Function to set up buttons
function setupButtons() {
  // Cancel subscription button
  const cancelButton = document.querySelector('.cancel-button');
  if (cancelButton) {
      cancelButton.addEventListener('click', function() {
          if (confirm('Are you sure you want to cancel your subscription?')) {
              alert('Subscription cancelled');
          }
      });
  }
  
  // Connect wallet button
  const connectWalletButton = document.querySelector('.connect-wallet-button');
  if (connectWalletButton) {
      connectWalletButton.addEventListener('click', function() {
          alert('Connecting wallet...');
      });
  }
  
  // Sign out buttons
  const signoutButtons = document.querySelectorAll('.signout-button');
  signoutButtons.forEach(button => {
      button.addEventListener('click', function() {
          const deviceName = this.closest('.device-item').querySelector('.device-name').textContent;
          if (confirm(`Are you sure you want to sign out from ${deviceName}?`)) {
              alert(`Signed out from ${deviceName}`);
              // In a real app, you would make an API call to sign out the device
              // and then update the UI
              this.closest('.device-item').style.opacity = '0.5';
              this.textContent = 'Signed out';
              this.disabled = true;
          }
      });
  });
  
  // Sign out of all devices button
  const signoutAllButton = document.querySelector('.signout-all-button');
  if (signoutAllButton) {
      signoutAllButton.addEventListener('click', function() {
          if (confirm('Are you sure you want to sign out from all devices?')) {
              alert('Signed out from all devices');
              // In a real app, you would make an API call to sign out all devices
              // and then update the UI
              document.querySelectorAll('.device-item').forEach(item => {
                  item.style.opacity = '0.5';
                  const button = item.querySelector('.signout-button');
                  if (button) {
                      button.textContent = 'Signed out';
                      button.disabled = true;
                  }
              });
              this.textContent = 'All devices signed out';
              this.disabled = true;
          }
      });
  }
  
  // Delete account button
  const deleteAccountButton = document.querySelector('.delete-account-button');
  if (deleteAccountButton) {
      deleteAccountButton.addEventListener('click', function() {
          if (confirm('WARNING: This action cannot be undone. Are you sure you want to delete your account?')) {
              if (prompt('Please type "DELETE" to confirm account deletion:') === 'DELETE') {
                  alert('Account deletion process initiated. You will receive a confirmation email.');
                  // In a real app, you would make an API call to initiate account deletion
              }
          }
      });
  }
}

// Function to handle theme changes
function handleThemeChange(theme) {
  // This would apply different CSS variables or classes based on the selected theme
  document.body.className = theme.toLowerCase();
  console.log('Theme changed to:', theme);
}

// Function to handle language changes
function handleLanguageChange(language) {
  // This would load different language strings and update the UI
  console.log('Language changed to:', language);
  // In a real app, you would reload the page with the new language or dynamically update text
}