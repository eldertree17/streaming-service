// browserify-build.js
const fs = require('fs');
const path = require('path');
const browserify = require('browserify');

// Create a browserify instance targeting our torrent service
const b = browserify();
b.add('./torrent-service.js');

// Write the bundled file to dist
const writeStream = fs.createWriteStream('./torrent-service.bundle.js');
b.bundle().pipe(writeStream);

writeStream.on('finish', () => {
  console.log('Browserify bundle created successfully.');
});

writeStream.on('error', (err) => {
  console.error('Error creating browserify bundle:', err);
});