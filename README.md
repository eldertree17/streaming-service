# StreamFlix

A modern streaming service platform that combines traditional video streaming with WebTorrent technology for efficient content delivery. This project provides a seamless video streaming experience with both direct streaming and torrent-based streaming capabilities.

## Features

- Video streaming through traditional HTTP methods
- WebTorrent integration for P2P content delivery
- Responsive web interface
- Support for multiple video formats
- URL normalization for consistent video access
- Server-side configuration for optimal content delivery

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser with WebRTC support

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd streaming-service
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory and add necessary configurations:
```
PORT=8001
MONGODB_URI=your_mongodb_uri
API_KEY=your_api_key
```

## Project Structure

- `/pages` - HTML pages for different views
- `/js` - JavaScript files for client-side functionality
- `/css` - Stylesheets
- `/streaming-service-backend` - Backend server implementation
- `/videos` - Video storage directory
- `/seeded-torrents` - WebTorrent seed files
- `/assets` - Static assets
- `/test-videos` - Test content for development

## Usage

### Development Mode

Run the application in development mode with hot reloading:
```bash
npm run dev
```

### Production Mode

Start the server in production mode:
```bash
npm start
```

### Serve with Custom Configuration

Use the custom server configuration:
```bash
npm run serve
```

## Video Access

Videos can be accessed through two equivalent URLs:
- `http://localhost:8001/pages/watch.html?id=video-id`
- `http://localhost:8001/pages/watch?id=video-id`

## Dependencies

- Express.js - Web application framework
- Mongoose - MongoDB object modeling
- WebTorrent - Streaming torrent client
- dotenv - Environment variable management
- CORS - Cross-origin resource sharing

## Development Dependencies

- nodemon - Development server with auto-reload

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Documentation

Additional documentation can be found in:
- URL-FIX-DOCUMENTATION.md
- URL-REDIRECTION.md
- URL-NORMALIZATION.md 