# URL Redirection for Streaming Service

This documentation outlines how to implement URL redirection for the watch page:
- Redirects `http://localhost:8001/pages/watch.html?id=sample-video-1` 
- To the working version at `http://localhost:8001/pages/watch?id=sample-video-1`

## Overview

We've implemented a dual-layer redirection strategy to ensure users always access the functional version of the watch page:

1. **Server-side redirection** intercepts requests to `/pages/watch.html` and redirects to `/pages/watch`
2. **Client-side fallback** catches any cases where server redirection might fail

## Implementation Details

### 1. Client-Side Redirection

A small script at the top of `watch.html` automatically redirects if the user accesses the page with the `.html` extension:

```javascript
// Only run on watch.html
if (window.location.pathname.endsWith('/watch.html')) {
    const queryString = window.location.search || '';
    const newUrl = window.location.origin + 
                  window.location.pathname.replace('watch.html', 'watch') + 
                  queryString;
    window.location.replace(newUrl);
}
```

### 2. Server-Side Redirection

We've provided three options for server-side redirection:

#### Option A: Express Server (Node.js)
- `server-config.js` implements Express redirects
- Run with `npm run serve`

#### Option B: Apache Server
- `.htaccess` contains rewrite rules for Apache
- Place in your web root directory

#### Option C: Nginx Server
- `nginx.conf` provides redirect configuration for Nginx
- Include in your server configuration

## How to Use

1. Choose and implement one of the server-side options:

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

2. The client-side script is already added to `watch.html` as a fallback

## Verification

To verify the solution works:
1. Access the page using `http://localhost:8001/pages/watch.html?id=sample-video-1`
2. Confirm you are automatically redirected to `http://localhost:8001/pages/watch?id=sample-video-1`
3. Verify that the page functions correctly after redirection

## Notes

- No changes have been made to `watch.js`
- All WebTorrent functionality remains untouched
- This approach is SEO-friendly due to the use of 301 (permanent) redirects 