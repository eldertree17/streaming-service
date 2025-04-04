const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// @route   GET api/video
// @desc    Get a sample video that is guaranteed to work
// @access  Public
router.get('/video', (req, res) => {
  try {
    // This is a public domain Big Buck Bunny video that's guaranteed to work
    const sampleContent = {
      _id: "sample-video-1",
      title: "Big Buck Bunny",
      description: "Big Buck Bunny is a short animated film by the Blender Institute, part of the Blender Foundation. It's a public domain test video that's widely used for testing video players.",
      posterImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
      magnetLink: "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent",
      telegramChannelId: "@bigbuckbunny",
      genre: ["Animation", "Short", "Comedy", "Public Domain"],
      releaseYear: 2008,
      duration: "9m 56s",
      likes: 9999,
      dislikes: 0,
      createdAt: new Date()
    };
    
    res.json(sampleContent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/content
// @desc    Get all content
// @access  Public
router.get('/', async (req, res) => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });
    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/content/:id
// @desc    Get content by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ msg: 'Content not found' });
    }
    
    res.json(content);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Content not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   GET api/content/search
// @desc    Search content
// @access  Public
router.get('/search', async (req, res) => {
  const query = req.query.query;
  
  if (!query) {
    return res.status(400).json({ msg: 'Query parameter required' });
  }
  
  try {
    // Search by title or description using text index
    const content = await Content.find({
      $text: { $search: query }
    }).sort({ score: { $meta: 'textScore' } });
    
    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/content/:id/like
// @desc    Like a content item
// @access  Public
router.post('/:id/like', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ msg: 'Content not found' });
    }
    
    // Increment likes
    content.likes += 1;
    
    await content.save();
    
    res.json(content);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Content not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST api/content/:id/dislike
// @desc    Dislike a content item
// @access  Public
router.post('/:id/dislike', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ msg: 'Content not found' });
    }
    
    // Increment dislikes
    content.dislikes += 1;
    
    await content.save();
    
    res.json(content);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Content not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

module.exports = router;