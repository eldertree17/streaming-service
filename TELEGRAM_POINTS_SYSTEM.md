# Telegram Mini App Points System

This document explains how the points system works with the Telegram Mini App integration.

## Overview

The points system rewards users for seeding content through WebTorrent. Points are earned based on:
- Upload speed (KB/s)
- Number of connected peers
- Seeding time

Points are stored server-side and associated with the user's Telegram ID, ensuring they persist across sessions and devices.

## How It Works

### User Identification

When a user opens the Telegram Mini App, we automatically retrieve their Telegram user ID from the WebApp initialization data:

```javascript
const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
```

This unique identifier is used to track points and associate them with the correct user.

### Points Calculation

Points are awarded based on these factors:
- 10 points per GB uploaded
- 0.5 points per second of seeding time
- 1 point per peer connected

The system reports metrics every 2 seconds while seeding is active.

### API Endpoints

Two new API endpoints have been added to support the points system:

1. **POST /api/metrics/telegram-seeding**
   - Records seeding metrics from Telegram users
   - Creates a user account if none exists
   - Updates the user's points and stats
   - Returns the current points balance

2. **GET /api/metrics/user-points**
   - Retrieves the current points balance for a Telegram user
   - Returns zero points for new users
   - Includes additional stats (upload amount, seeding time, etc.)

### Client-Side Integration

The WebTorrent functionality sends metrics to these endpoints:

1. When the page loads, it fetches the user's current points
2. While seeding, it reports metrics every 2 seconds
3. The UI updates in real-time to show the current points balance

## Testing

To test if the points system is working:

1. Open the Mini App through Telegram
2. Navigate to a video page and start seeding
3. Check the points counter in the stats panel
4. View detailed stats in the rewards modal

## Troubleshooting

If points aren't being earned, check:

1. Console logs for API errors
2. That your Telegram Mini App is correctly initialized
3. That the backend server is running and accessible
4. That upload speed is greater than zero

## Server Configuration

The backend is hosted on Render.com at:
```
https://streamflix-backend.onrender.com
```

Make sure CORS is properly configured to allow requests from the GitHub Pages domain. 