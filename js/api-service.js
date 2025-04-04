// js/api-service.js
const API_URL = 'http://localhost:5003/api';

// Get all content
async function getAllContent() {
  try {
    console.log('Fetching all content from:', `${API_URL}/content`);
    const response = await fetch(`${API_URL}/content`, {
      // Add these options to help with CORS issues
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Received content data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching content:', error);
    return [];
  }
}

// Get content by ID
async function getContentById(id) {
  try {
    console.log('Fetching content by ID:', id);
    
    // Special case for sample video
    if (id === 'sample-video-1') {
      console.log('Fetching sample video from /api/video endpoint');
      const response = await fetch(`${API_URL}/video`, {
        // Add these options to help with CORS issues
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Sample video content received:', data);
      return data;
    }
    
    // Regular content fetching
    console.log('API URL:', `${API_URL}/content/${id}`);
    const response = await fetch(`${API_URL}/content/${id}`, {
      // Add these options to help with CORS issues
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Content details received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    // Provide more helpful error information
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      id: id
    });
    throw error;
  }
}

// Search content
async function searchContent(query) {
  try {
    const response = await fetch(`${API_URL}/content/search?query=${query}`, {
      // Add these options to help with CORS issues
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching content:', error);
    return [];
  }
}

// Like content
async function likeContent(id) {
  try {
    const response = await fetch(`${API_URL}/content/${id}/like`, {
      method: 'POST',
      // Add these options to help with CORS issues
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error liking content:', error);
    throw error;
  }
}

// Dislike content
async function dislikeContent(id) {
  try {
    const response = await fetch(`${API_URL}/content/${id}/dislike`, {
      method: 'POST',
      // Add these options to help with CORS issues
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error disliking content:', error);
    throw error;
  }
}