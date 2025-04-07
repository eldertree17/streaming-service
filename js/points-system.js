// Points System for Telegram Mini App
class PointsSystem {
    constructor() {
        this.webApp = window.Telegram?.WebApp;
        this.userId = this.webApp?.initDataUnsafe?.user?.id || 'browser-test-user';
        this.points = 0;
        this.lastUpdate = Date.now();
        this.loadPoints();
    }

    // Load points from localStorage with Telegram user ID
    loadPoints() {
        try {
            const savedPoints = localStorage.getItem(`points_${this.userId}`);
            if (savedPoints) {
                this.points = parseInt(savedPoints, 10);
                console.log('Loaded points for user:', this.points);
            }
        } catch (e) {
            console.error('Error loading points:', e);
        }
    }

    // Save points to localStorage
    savePoints() {
        try {
            localStorage.setItem(`points_${this.userId}`, this.points.toString());
            console.log('Saved points for user:', this.points);
        } catch (e) {
            console.error('Error saving points:', e);
        }
    }

    // Add points based on seeding metrics
    addPoints(uploadSpeed, numPeers) {
        // Calculate points based on upload speed (bytes/s) and number of peers
        // 1 point per 50KB/s of upload speed per peer
        const pointsToAdd = Math.floor((uploadSpeed / 51200) * numPeers);
        
        if (pointsToAdd > 0) {
            this.points += pointsToAdd;
            this.savePoints();
            
            // Update UI
            const earningRate = document.getElementById('earning-rate');
            if (earningRate) {
                earningRate.textContent = this.points;
            }
            
            // Notify Telegram app of points update
            if (this.webApp && this.webApp.CloudStorage) {
                this.webApp.CloudStorage.setItem('points', this.points.toString());
            }
        }
    }

    // Get current points
    getPoints() {
        return this.points;
    }
}

// Initialize points system
window.pointsSystem = new PointsSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PointsSystem;
} 