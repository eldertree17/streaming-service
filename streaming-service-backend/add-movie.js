const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Content model
const Content = require('./models/Content.js');

// Connect to MongoDB - Fix URI variable name
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Movie data
const movieData = {
  title: "Earth vs. the Flying Saucers",
  description: "Dr. Russell Marvin works for Operation Skyhook, a government task force sending rockets into space to probe for future space stations. Unfortunately all of the rockets are somehow disappearing. While investigating the latest rocket disappearance with his wife Carol, a flying saucer lands and the pilots tell them that they have been destroying the rockets because they believe they are attacking their planet. They are given a choice, either join the aliens or die. Marvin manages to escape with his wife and colleague Dr. Alberts. Together they develop a weapon that might work against the invaders.",
  posterImage: "https://archive.org/services/img/earth-vs-the-flying-saucers-color",
  magnetLink: "magnet:?xt=urn:btih:JJEPOO2GT2IB4HGEPW7KOE5BBPQXWXQ6&dn=earth-vs-the-flying-saucers-color&tr=http%3A%2F%2Fbt1.archive.org%3A6969%2Fannounce",
  telegramChannelId: "@earthvsflying",
  genre: ["Sci-Fi", "Action", "Public Domain"],
  releaseYear: 1956,
  duration: "1h 23m"
};

// Function to add movie to database
async function addMovie() {
  try {
    // Check if movie already exists to avoid duplicates
    const existingMovie = await Content.findOne({ title: movieData.title });
    
    if (existingMovie) {
      console.log('Movie already exists in database');
      process.exit(0);
    }
    
    // Create new movie
    const movie = new Content(movieData);
    const savedMovie = await movie.save();
    
    console.log('Movie added successfully:', savedMovie);
    process.exit(0);
  } catch (error) {
    console.error('Error adding movie:', error);
    process.exit(1);
  }
}

// Run the function
addMovie();