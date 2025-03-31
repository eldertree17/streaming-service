/**
 * URL Normalizer - Ensures consistent functionality between different URL formats
 * 
 * This script runs early and ensures that /pages/watch.html?id=xyz and /pages/watch?id=xyz
 * both provide the same functionality without modifying the watch.js file.
 */

(function() {
    // Execute when DOM is fully loaded to avoid any race conditions
    document.addEventListener('DOMContentLoaded', function() {
        console.log('URL Normalizer initializing...');
        
        // Only run on watch pages
        const isWatchPage = window.location.pathname.includes('/pages/watch');
        if (!isWatchPage) return;
        
        console.log('Watch page detected, normalizing URL parameters...');
        
        // Extract query parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('id');
        const movieName = urlParams.get('movie');
        
        // Store the parameters in sessionStorage for access by any script
        if (videoId) {
            console.log('Video ID found:', videoId);
            sessionStorage.setItem('current_video_id', videoId);
        }
        
        if (movieName) {
            console.log('Movie name found:', movieName);
            sessionStorage.setItem('current_movie_name', movieName);
        }
        
        // Ensure all scripts can access the parameters regardless of URL format
        // This helps both /pages/watch.html?id=xyz and /pages/watch?id=xyz work the same
        if (!window.currentUrlParams) {
            window.currentUrlParams = {
                videoId: videoId,
                movieName: movieName
            };
        }
        
        console.log('URL parameters normalized. Page should function identically regardless of URL format.');
    });
})(); 