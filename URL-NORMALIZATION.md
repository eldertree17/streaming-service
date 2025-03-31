# URL Normalization for the Streaming Service

This documentation outlines how to ensure consistent functionality between different URL formats for the watch page: 
- `http://localhost:8001/pages/watch.html?id=sample-video-1`
- `http://localhost:8001/pages/watch?id=sample-video-1`

## Overview

We've implemented a solution that ensures both URL formats provide identical functionality without modifying `watch.js` or any WebTorrent-related code.

## Implementation Details

### 1. Client-Side URL Normalization

The `url-normalizer.js` script runs early in the page load process and:
- Extracts query parameters from either URL format
- Stores them in a consistent location (sessionStorage and window object)
- Makes them available to all scripts regardless of URL format

### 2. Server-Side URL Normalization

Several options are provided (choose one based on your server setup):

#### Option A: Express Server (Node.js)
- `server-config.js` provides a simple Express server that rewrites URLs
- Run with `npm run serve`

#### Option B: Apache Server
- `.htaccess` file handles URL rewriting on Apache servers
- Place in the root directory of your Apache server

#### Option C: Nginx Server
- `nginx.conf` provides configuration for Nginx servers
- Include in your main Nginx configuration

## How to Use

1. Include the URL normalizer script in your HTML:
   ```html
   <script src="../js/url-normalizer.js"></script>
   ```

2. Choose and implement one of the server-side options:

   **For Express:**
   ```bash
   npm run serve
   ```

   **For Apache:**
   - Place the `.htaccess` file in your root directory
   - Ensure Apache has `mod_rewrite` enabled

   **For Nginx:**
   - Include or adapt the provided `nginx.conf` in your server configuration
   - Reload Nginx: `nginx -s reload`

## Verification

To verify the solution works:
1. Access the page using both URL formats
2. Check the browser console for "URL Normalizer" log messages
3. Verify all functionality works identically on both URLs

## Notes

- No changes have been made to `watch.js`
- All WebTorrent functionality remains untouched
- The solution is implemented through additional files, not modifications 