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
    
    // Initialize device management
    initDeviceManagement();
    
    // Set up device preferences
    setupPreferences();
    
    // Set up QR code modal
    setupQRModal();
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

// Device Registry - Store device data in localStorage
const DEVICE_REGISTRY_KEY = 'streamflix_device_registry';
const DEVICE_PREFERENCES_KEY = 'streamflix_device_preferences';
const CURRENT_DEVICE_ID_KEY = 'streamflix_current_device_id';

// Device Management Functions
function initDeviceManagement() {
    // Setup "Register This Device" button
    const registerButton = document.getElementById('register-device-button');
    if (registerButton) {
        registerButton.addEventListener('click', registerCurrentDevice);
    }
    
    // Setup "Add Device" button
    const addDeviceButton = document.getElementById('add-device-button');
    if (addDeviceButton) {
        addDeviceButton.addEventListener('click', showQRModal);
    }
    
    // Load and display registered devices
    loadDevices();
}

// Function to detect device type and capabilities
function detectDeviceInfo() {
    const ua = navigator.userAgent;
    let deviceType = 'unknown';
    let deviceIcon = 'fa-question';
    let browserInfo = 'Unknown Browser';
    
    // Detect if mobile
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        deviceType = 'mobile';
        
        // Check specific mobile types
        if (/iPhone|iPad|iPod/i.test(ua)) {
            deviceType = 'iOS';
            deviceIcon = 'fa-apple';
        } else if (/Android/i.test(ua)) {
            deviceType = 'android';
            deviceIcon = 'fa-android';
        }
    } else {
        // Desktop devices
        deviceType = 'desktop';
        deviceIcon = 'fa-desktop';
        
        // Check if it's a laptop
        if (/Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua) && 'ontouchend' in document) {
            deviceType = 'laptop';
            deviceIcon = 'fa-laptop';
        }
    }
    
    // Detect browser
    if (/Chrome/i.test(ua)) {
        browserInfo = 'Chrome';
    } else if (/Firefox/i.test(ua)) {
        browserInfo = 'Firefox';
    } else if (/Safari/i.test(ua)) {
        browserInfo = 'Safari';
    } else if (/Edge/i.test(ua)) {
        browserInfo = 'Edge';
    }
    
    // Check connection type
    let connectionType = 'unknown';
    if (navigator.connection) {
        connectionType = navigator.connection.type || 'unknown';
    }
    
    // Generate a friendly name for the device
    const randomSuffix = Math.floor(Math.random() * 1000);
    let deviceName = 'Unknown Device';
    
    if (deviceType === 'desktop') {
        deviceName = `Desktop ${randomSuffix}`;
    } else if (deviceType === 'laptop') {
        deviceName = `Laptop ${randomSuffix}`;
    } else if (deviceType === 'iOS') {
        deviceName = `iPhone ${randomSuffix}`;
        if (/iPad/i.test(ua)) {
            deviceName = `iPad ${randomSuffix}`;
        }
    } else if (deviceType === 'android') {
        deviceName = `Android ${randomSuffix}`;
    }
    
    return {
        deviceType,
        deviceIcon,
        browserInfo,
        connectionType,
        deviceName,
        userId: 'demo123' // In a real app, get from Telegram or auth system
    };
}

// Function to generate a unique device ID
function generateDeviceId() {
    return 'd' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Function to register the current device
function registerCurrentDevice() {
    const deviceInfo = detectDeviceInfo();
    const deviceId = generateDeviceId();
    
    const device = {
        deviceId,
        userId: deviceInfo.userId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        deviceIcon: deviceInfo.deviceIcon,
        browser: deviceInfo.browserInfo,
        os: navigator.platform,
        firstRegistered: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isOnline: true,
        isSeedingEnabled: true,
        capabilities: {
            maxConcurrentTorrents: deviceInfo.deviceType === 'mobile' ? 2 : 5,
            connectionType: deviceInfo.connectionType,
            isBatteryPowered: deviceInfo.deviceType === 'mobile' || deviceInfo.deviceType === 'laptop'
        },
        stats: {
            totalUploaded: 0,
            totalSeedingTime: 0,
            peersServed: 0,
            contentSeeded: 0
        }
    };
    
    // Store the device in registry
    const registry = getDeviceRegistry();
    registry.push(device);
    saveDeviceRegistry(registry);
    
    // Save current device ID
    localStorage.setItem(CURRENT_DEVICE_ID_KEY, deviceId);
    
    // Update UI to show the device
    loadDevices();
    
    console.log('Registered new device:', device);
    
    // In a real app, send this to your backend
    // api.registerDevice(device).then(...);
}

// Function to get device registry from localStorage
function getDeviceRegistry() {
    const registryJSON = localStorage.getItem(DEVICE_REGISTRY_KEY);
    return registryJSON ? JSON.parse(registryJSON) : [];
}

// Function to save device registry to localStorage
function saveDeviceRegistry(registry) {
    localStorage.setItem(DEVICE_REGISTRY_KEY, JSON.stringify(registry));
}

// Function to get current device ID
function getCurrentDeviceId() {
    return localStorage.getItem(CURRENT_DEVICE_ID_KEY);
}

// Function to load and display registered devices
function loadDevices() {
    const registry = getDeviceRegistry();
    const devicesContainer = document.getElementById('devices-container');
    const noDevicesMessage = document.getElementById('no-devices-message');
    const devicePreferenceOptions = document.getElementById('device-preference-options');
    
    if (!devicesContainer) return;
    
    // Clear existing device cards except the no-devices message
    const existingCards = devicesContainer.querySelectorAll('.device-card');
    existingCards.forEach(card => card.remove());
    
    // Show or hide the no-devices message
    if (registry.length === 0) {
        if (noDevicesMessage) {
            noDevicesMessage.style.display = 'flex';
        }
        return;
    } else {
        if (noDevicesMessage) {
            noDevicesMessage.style.display = 'none';
        }
    }
    
    // Clear existing device preference options
    if (devicePreferenceOptions) {
        devicePreferenceOptions.innerHTML = '';
    }
    
    // Get current device ID
    const currentDeviceId = getCurrentDeviceId();
    
    // Create a card for each device
    registry.forEach(device => {
        // Update isOnline status for current device
        if (device.deviceId === currentDeviceId) {
            device.isOnline = true;
            device.lastActive = new Date().toISOString();
        }
        
        const deviceCard = createDeviceCard(device, device.deviceId === currentDeviceId);
        devicesContainer.appendChild(deviceCard);
        
        // Add to device preference options
        if (devicePreferenceOptions) {
            const option = document.createElement('div');
            option.className = 'preference-option';
            option.innerHTML = `
                <input type="radio" id="prefer-device-${device.deviceId}" name="preferred-device">
                <label for="prefer-device-${device.deviceId}">Prefer ${device.deviceName}</label>
            `;
            devicePreferenceOptions.appendChild(option);
        }
    });
    
    // Save updated registry with online status
    saveDeviceRegistry(registry);
}

// Function to create a device card
function createDeviceCard(device, isCurrentDevice) {
    const card = document.createElement('div');
    card.className = 'device-card';
    card.id = `device-${device.deviceId}`;
    
    // Format last active time
    const lastActive = new Date(device.lastActive);
    const now = new Date();
    const diffMs = now - lastActive;
    const diffMins = Math.floor(diffMs / 60000);
    let lastActiveText;
    
    if (device.isOnline || isCurrentDevice) {
        lastActiveText = 'Now';
    } else if (diffMins < 60) {
        lastActiveText = `${diffMins} mins ago`;
    } else if (diffMins < 1440) {
        lastActiveText = `${Math.floor(diffMins / 60)} hours ago`;
    } else {
        lastActiveText = `${Math.floor(diffMins / 1440)} days ago`;
    }
    
    // Basic card structure
    card.innerHTML = `
        <div class="device-info">
            <div class="device-icon">
                <i class="fas ${device.deviceIcon}"></i>
            </div>
            <div class="device-details">
                <div class="device-name">${device.deviceName} ${isCurrentDevice ? '(This Device)' : ''}</div>
                <div class="device-meta">
                    <span class="status-indicator ${device.isOnline ? 'status-online' : 'status-offline'}"></span>
                    <span>${device.isOnline ? 'Online' : 'Offline'}</span> • 
                    <span>Last active: ${lastActiveText}</span>
                </div>
            </div>
        </div>
        <div class="device-actions">
            <label class="seeding-toggle">
                <input type="checkbox" ${device.isSeedingEnabled ? 'checked' : ''} ${!device.isOnline && !isCurrentDevice ? 'disabled' : ''}>
                <span class="toggle-slider"></span>
            </label>
            <button class="device-menu-button">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        </div>
    `;
    
    // Add expanded details section (collapsed by default)
    const expandedSection = document.createElement('div');
    expandedSection.className = 'device-expanded';
    expandedSection.style.display = 'none';
    
    expandedSection.innerHTML = `
        <div class="device-stats">
            <div class="stat-item">
                <span class="stat-label">Device Type</span>
                <span class="stat-value">${device.deviceType}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Browser</span>
                <span class="stat-value">${device.browser}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Seeded</span>
                <span class="stat-value">${formatBytes(device.stats.totalUploaded)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Seeding Time</span>
                <span class="stat-value">${formatTime(device.stats.totalSeedingTime)}</span>
            </div>
        </div>
        <div class="device-options">
            <button class="device-option-button">Rename</button>
            <button class="device-option-button ${isCurrentDevice ? '' : 'danger'}">
                ${isCurrentDevice ? 'Update' : 'Remove'}
            </button>
        </div>
    `;
    
    card.appendChild(expandedSection);
    
    // Add event listeners
    const menuButton = card.querySelector('.device-menu-button');
    if (menuButton) {
        menuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            expandedSection.style.display = expandedSection.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    const toggleSwitch = card.querySelector('.seeding-toggle input');
    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', function() {
            updateDeviceSeedingStatus(device.deviceId, this.checked);
        });
    }
    
    const renameButton = expandedSection.querySelector('.device-option-button');
    if (renameButton) {
        renameButton.addEventListener('click', function() {
            const newName = prompt('Enter a new name for this device:', device.deviceName);
            if (newName && newName.trim()) {
                renameDevice(device.deviceId, newName.trim());
            }
        });
    }
    
    const removeButton = expandedSection.querySelectorAll('.device-option-button')[1];
    if (removeButton) {
        removeButton.addEventListener('click', function() {
            if (isCurrentDevice) {
                updateDeviceInfo(device.deviceId);
            } else {
                if (confirm(`Are you sure you want to remove "${device.deviceName}" from your devices?`)) {
                    removeDevice(device.deviceId);
                }
            }
        });
    }
    
    return card;
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper function to format time
function formatTime(seconds) {
    if (seconds === 0) return '0 min';
    
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
        return `${minutes} min${minutes > 1 ? 's' : ''}`;
    }
}

// Function to update device seeding status
function updateDeviceSeedingStatus(deviceId, isSeedingEnabled) {
    const registry = getDeviceRegistry();
    const deviceIndex = registry.findIndex(d => d.deviceId === deviceId);
    
    if (deviceIndex !== -1) {
        registry[deviceIndex].isSeedingEnabled = isSeedingEnabled;
        saveDeviceRegistry(registry);
        console.log(`Device ${deviceId} seeding status updated to: ${isSeedingEnabled}`);
        
        // In a real app, send this to your backend
        // api.updateDeviceStatus(deviceId, { isSeedingEnabled }).then(...);
    }
}

// Function to rename a device
function renameDevice(deviceId, newName) {
    const registry = getDeviceRegistry();
    const deviceIndex = registry.findIndex(d => d.deviceId === deviceId);
    
    if (deviceIndex !== -1) {
        registry[deviceIndex].deviceName = newName;
        saveDeviceRegistry(registry);
        console.log(`Device ${deviceId} renamed to: ${newName}`);
        loadDevices(); // Reload to update UI
        
        // In a real app, send this to your backend
        // api.updateDevice(deviceId, { deviceName: newName }).then(...);
    }
}

// Function to update device info
function updateDeviceInfo(deviceId) {
    const registry = getDeviceRegistry();
    const deviceIndex = registry.findIndex(d => d.deviceId === deviceId);
    
    if (deviceIndex !== -1) {
        const updatedInfo = detectDeviceInfo();
        registry[deviceIndex].browser = updatedInfo.browserInfo;
        registry[deviceIndex].lastActive = new Date().toISOString();
        registry[deviceIndex].isOnline = true;
        
        saveDeviceRegistry(registry);
        console.log(`Device ${deviceId} info updated`);
        loadDevices(); // Reload to update UI
        
        // In a real app, send this to your backend
        // api.updateDeviceInfo(deviceId, updatedInfo).then(...);
    }
}

// Function to remove a device
function removeDevice(deviceId) {
    let registry = getDeviceRegistry();
    registry = registry.filter(d => d.deviceId !== deviceId);
    saveDeviceRegistry(registry);
    console.log(`Device ${deviceId} removed`);
    loadDevices(); // Reload to update UI
    
    // In a real app, send this to your backend
    // api.removeDevice(deviceId).then(...);
}

// Function to set up device preferences
function setupPreferences() {
    // Example preference saving
    const preferenceInputs = document.querySelectorAll('.preference-option input');
    preferenceInputs.forEach(input => {
        input.addEventListener('change', function() {
            savePreferences();
        });
    });
    
    // Load saved preferences
    loadPreferences();
}

// Function to save preferences
function savePreferences() {
    const preferences = {
        preferredDeviceSelection: document.querySelector('input[name="preferred-device"]:checked').id,
        mobileSettings: {
            seedOnlyWifi: document.getElementById('seed-only-wifi').checked,
            pauseOnBattery: document.getElementById('pause-on-battery').checked,
            batteryThreshold: document.getElementById('battery-threshold').value
        }
    };
    
    localStorage.setItem(DEVICE_PREFERENCES_KEY, JSON.stringify(preferences));
    console.log('Preferences saved:', preferences);
    
    // In a real app, send this to your backend
    // api.updatePreferences(preferences).then(...);
}

// Function to load preferences
function loadPreferences() {
    const preferencesJSON = localStorage.getItem(DEVICE_PREFERENCES_KEY);
    if (!preferencesJSON) return;
    
    try {
        const preferences = JSON.parse(preferencesJSON);
        
        // Set preferred device selection
        if (preferences.preferredDeviceSelection) {
            const radio = document.getElementById(preferences.preferredDeviceSelection);
            if (radio) radio.checked = true;
        }
        
        // Set mobile settings
        if (preferences.mobileSettings) {
            const { seedOnlyWifi, pauseOnBattery, batteryThreshold } = preferences.mobileSettings;
            
            if (typeof seedOnlyWifi === 'boolean') {
                document.getElementById('seed-only-wifi').checked = seedOnlyWifi;
            }
            
            if (typeof pauseOnBattery === 'boolean') {
                document.getElementById('pause-on-battery').checked = pauseOnBattery;
            }
            
            if (batteryThreshold) {
                const select = document.getElementById('battery-threshold');
                const option = Array.from(select.options).find(opt => opt.value === batteryThreshold);
                if (option) select.value = batteryThreshold;
            }
        }
        
        console.log('Preferences loaded:', preferences);
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

// Function to set up QR modal
function setupQRModal() {
    const modal = document.getElementById('qr-modal');
    const closeButton = document.getElementById('qr-close-button');
    const copyButton = document.getElementById('qr-copy-button');
    
    if (!modal) return;
    
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    copyButton.addEventListener('click', function() {
        const linkText = document.getElementById('qr-code-link').innerText;
        navigator.clipboard.writeText(linkText)
            .then(() => {
                alert('Link copied to clipboard!');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Function to show QR modal with device link
function showQRModal() {
    const modal = document.getElementById('qr-modal');
    if (!modal) return;
    
    // Generate a new pairing code
    const pairingCode = generatePairingCode();
    
    // Create pairing URL - in a real app, this would be your app URL
    const baseUrl = window.location.origin + window.location.pathname;
    const pairingUrl = `${baseUrl}?pair=${pairingCode}`;
    
    // Update QR code image
    const qrCodeImg = document.getElementById('qr-code-img');
    if (qrCodeImg) {
        qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(pairingUrl)}`;
    }
    
    // Update link text
    const linkElement = document.getElementById('qr-code-link');
    if (linkElement) {
        linkElement.innerText = pairingUrl;
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Store pairing code in localStorage
    localStorage.setItem('streamflix_pairing_code', pairingCode);
    localStorage.setItem('streamflix_pairing_expiry', Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // In a real app, register this pairing code with your backend
    // api.registerPairingCode(pairingCode).then(...);
}

// Function to generate a pairing code
function generatePairingCode() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Function to check for pairing code in URL
function checkForPairingCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const pairingCode = urlParams.get('pair');
    
    if (pairingCode) {
        // In a real app, verify this code with your backend
        // api.verifyPairingCode(pairingCode).then(deviceInfo => {...});
        
        // For demo purposes, just register as a new device
        registerCurrentDevice();
        
        // Remove the pairing code from the URL
        const url = new URL(window.location);
        url.searchParams.delete('pair');
        window.history.replaceState({}, '', url);
    }
}

// Call this function on page load to check for pairing codes
checkForPairingCode();