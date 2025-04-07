# Streaming Service API

This is the API server for the streaming service, handling points tracking for Telegram Mini App users.

## Features

- Tracks points earned by users for seeding content
- Associates points with Telegram user IDs
- Stores user points and seeding history
- Provides endpoints for retrieving user points and reporting metrics

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## API Endpoints

### GET /api/user/points

Retrieves the points for a user.

**Parameters:**
- `userId`: The Telegram user ID

**Response:**
```json
{
  "points": 100
}
```

### POST /api/metrics/seeding

Reports seeding metrics for a user.

**Request Body:**
```json
{
  "userId": "12345678",
  "contentId": "sample-video-1",
  "uploadSpeed": 1024,
  "peersConnected": 2,
  "seedingTime": 2
}
```

**Response:**
```json
{
  "success": true,
  "tokensEarned": 0.8192,
  "totalPoints": 100.8192
}
```

## Deployment

This API can be deployed to any Node.js hosting service like:

1. Render.com
2. Heroku
3. DigitalOcean
4. AWS
5. Google Cloud Run

For production use with the Telegram Mini App, ensure:
1. The API runs on HTTPS
2. CORS is properly configured
3. The domain is properly registered with Telegram BotFather 