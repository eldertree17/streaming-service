// Watch Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp if available
    if (window.Telegram && window.Telegram.WebApp) {
    // Tell Telegram that the Mini App is ready
    window.Telegram.WebApp.ready();
    
    // Optionally expand the Mini App to full height
    window.Telegram.WebApp.expand();
    
    console.log("Telegram WebApp initialized");
  }
  // Initialize watch page
  initWatchPage();
  
  // Set up back button
  setupBackButton();
  
  // Set up comment input
  setupCommentInput();
  
  // Set up modals
  setupModals();

  // Set up title like/dislike buttons
  setupTitleActions();
});

// Function to set up back button
function setupBackButton() {
  const backButton = document.getElementById('back-button');
  
  if (backButton) {
      backButton.addEventListener('click', function() {
          // Navigate back to previous page
          window.history.back();
      });
  }
}

// Function to initialize the watch page
function initWatchPage() {
  // Load movie data (in a real app, this would come from an API)
  loadMovieData();
  
  // Populate cast carousel
  populateCastCarousel();
  
  // Populate rewards carousel
  populateRewardsCarousel();
  
  // Populate similar movies carousel
  populateSimilarMoviesCarousel();
  
  // Load comments
  loadComments();
}

// Function to load movie data
function loadMovieData() {
  // In a real app, this would fetch data from an API
  // For demo, we'll use mock data
  const movieData = {
    title: "Inception",
    year: "2010",
    rating: "PG-13",
    duration: "2h 28m",
    quality: "HD",
    genres: ["Sci-Fi", "Action", "Adventure"],
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
  };
  
  // Update UI with movie data
  document.getElementById('movie-title').textContent = movieData.title;
  document.querySelector('.year').textContent = movieData.year;
  document.querySelector('.rating').textContent = movieData.rating;
  document.querySelector('.duration').textContent = movieData.duration;
  document.querySelector('.quality').textContent = movieData.quality;
  
  // Clear and populate genres
  const genreTags = document.querySelector('.genre-tags');
  genreTags.innerHTML = '';
  
  movieData.genres.forEach(genre => {
    const genreSpan = document.createElement('span');
    genreSpan.className = 'genre';
    genreSpan.textContent = genre;
    genreTags.appendChild(genreSpan);
  });
  
  // Update description
  document.querySelector('.movie-description p').textContent = movieData.description;
}

// Function to populate cast carousel
function populateCastCarousel() {
  const castCarousel = document.querySelector('.cast-carousel');
  
  // Clear existing content
  castCarousel.innerHTML = '';
  
  // In a real app, this would fetch data from an API
  // For demo, we'll use mock data
  const castData = [
    {
      name: "Leonardo DiCaprio",
      role: "Cobb",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
    },
    {
      name: "Joseph Gordon-Levitt",
      role: "Arthur",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
    },
    {
      name: "Ellen Page",
      role: "Ariadne",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    {
      name: "Tom Hardy",
      role: "Eames",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
    },
    {
      name: "Ken Watanabe",
      role: "Saito",
      image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3"
    },
    {
      name: "Michael Caine",
      role: "Miles",
      image: "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f"
    }
  ];
  
  // Populate cast carousel
  castData.forEach(actor => {
    const castItem = document.createElement('div');
    castItem.className = 'cast-item';
    
    castItem.innerHTML = `
      <img src="${actor.image}" alt="${actor.name}">
      <div class="cast-name">${actor.name}</div>
      <div class="cast-role">${actor.role}</div>
    `;
    
    castCarousel.appendChild(castItem);
  });
  
  // Also populate the cast grid in the modal
  const castGrid = document.querySelector('.cast-grid');
  castGrid.innerHTML = '';
  
  castData.forEach(actor => {
    const castItem = document.createElement('div');
    castItem.className = 'cast-item';
    
    castItem.innerHTML = `
      <img src="${actor.image}" alt="${actor.name}">
      <div class="cast-name">${actor.name}</div>
      <div class="cast-role">${actor.role}</div>
    `;
    
    castGrid.appendChild(castItem);
  });
}

// Function to populate rewards carousel
function populateRewardsCarousel() {
  const rewardsCarousel = document.querySelector('.rewards-carousel');
  
  // Clear existing content
  rewardsCarousel.innerHTML = '';
  
  // In a real app, this would fetch data from an API
  // For demo, we'll use mock data
  const rewardsData = [
    {
      name: "Oscar",
      description: "Best Original Screenplay",
      image: "https://images.unsplash.com/photo-1598394888170-951386e28d98"
    },
    {
      name: "Golden Globe",
      description: "Best Motion Picture",
      image: "https://images.unsplash.com/photo-1604076913837-52ab5629fba9"
    },
    {
      name: "BAFTA",
      description: "Best Production Design",
      image: "https://images.unsplash.com/photo-1579087528039-2d3eda4fb5d5"
    },
    {
      name: "Saturn Award",
      description: "Best Science Fiction Film",
      image: "https://images.unsplash.com/photo-1579087528039-2d3eda4fb5d5"
    }
  ];
  
  // Populate rewards carousel
  rewardsData.forEach(reward => {
    const rewardItem = document.createElement('div');
    rewardItem.className = 'reward-item';
    
    rewardItem.innerHTML = `
      <img src="${reward.image}" alt="${reward.name}">
      <div class="reward-name">${reward.name}</div>
      <div class="reward-description">${reward.description}</div>
    `;
    
    rewardsCarousel.appendChild(rewardItem);
  });
  
  // Also populate the rewards grid in the modal
  const rewardsGrid = document.querySelector('.rewards-grid');
  rewardsGrid.innerHTML = '';
  
  rewardsData.forEach(reward => {
    const rewardItem = document.createElement('div');
    rewardItem.className = 'reward-item';
    
    rewardItem.innerHTML = `
      <img src="${reward.image}" alt="${reward.name}">
      <div class="reward-name">${reward.name}</div>
      <div class="reward-description">${reward.description}</div>
    `;
    
    rewardsGrid.appendChild(rewardItem);
  });
}

// Function to populate similar movies carousel
function populateSimilarMoviesCarousel() {
  const similarCarousel = document.querySelector('.similar-carousel');
  
  // Clear existing content
  similarCarousel.innerHTML = '';
  
  // In a real app, this would fetch data from an API
  // For demo, we'll use mock data
  const similarMoviesData = [
    {
      title: "The Matrix",
      year: "1999",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1"
    },
    {
      title: "Interstellar",
      year: "2014",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401"
    },
    {
      title: "Shutter Island",
      year: "2010",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26"
    },
    {
      title: "The Prestige",
      year: "2006",
      image: "https://images.unsplash.com/photo-1559583109-3e7968e11449"
    },
    {
      title: "Memento",
      year: "2000",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1"
    }
  ];
  
  // Populate similar movies carousel
  similarMoviesData.forEach(movie => {
    const similarItem = document.createElement('div');
    similarItem.className = 'similar-item';
    
    similarItem.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}">
      <div class="similar-title">${movie.title}</div>
      <div class="similar-year">${movie.year}</div>
    `;
    
    similarCarousel.appendChild(similarItem);
  });
}

// Function to load comments
function loadComments() {
  const commentsList = document.querySelector('.comments-list');
  const allCommentsList = document.querySelector('.all-comments-list');
  
  // Clear existing content
  commentsList.innerHTML = '';
  if (allCommentsList) {
    allCommentsList.innerHTML = '';
  }
  
  // In a real app, this would fetch comments from an API
  // For demo, we'll use mock data
  const comments = [
    {
      id: 1,
      author: "John Doe",
      avatar: "../img/avatars/user1.jpg",
      time: "2 hours ago",
      text: "This movie was absolutely mind-blowing! The concept of dream invasion is so unique.",
      isCurrentUser: false,
      likes: 24,
      replies: []
    },
    {
      id: 2,
      author: "You",
      avatar: "../img/avatars/user.jpg",
      time: "1 hour ago",
      text: "I loved the visual effects and the soundtrack. Hans Zimmer did an amazing job!",
      isCurrentUser: true,
      likes: 12,
      replies: []
    }
    // Add more comments as needed
  ];
  
  // Render each comment
  comments.forEach(comment => {
    // Create comment for main list
    const commentElement = createCommentElement(comment);
    commentsList.appendChild(commentElement);
    
    // Create comment for modal list if it exists
    if (allCommentsList) {
      const modalCommentElement = createCommentElement(comment);
      allCommentsList.appendChild(modalCommentElement);
    }
  });
  
  // Set up comment actions after rendering
  setupCommentActions();
}

// Function to create a comment element
function createCommentElement(comment) {
  const commentElement = document.createElement('div');
  commentElement.className = 'comment';
  commentElement.dataset.commentId = comment.id;
  
  let deleteButton = '';
  if (comment.isCurrentUser) {
    deleteButton = `
      <button class="comment-action delete-action">
        <i class="far fa-trash-alt"></i> Delete
      </button>
    `;
  }
  
  commentElement.innerHTML = `
    <div class="comment-avatar">
      <img src="${comment.avatar}" alt="${comment.author}">
    </div>
    <div class="comment-content">
      <div class="comment-author">${comment.author}</div>
      <div class="comment-time">${comment.time}</div>
      <div class="comment-text">${comment.text}</div>
      <div class="comment-actions-row">
        <button class="comment-action like-action">
          <i class="far fa-thumbs-up"></i> ${comment.likes}
        </button>
        <button class="comment-action reply-action">
          <i class="far fa-comment"></i> Reply
        </button>
        ${deleteButton}
      </div>
    </div>
  `;
  
  // Render replies if any
  if (comment.replies && comment.replies.length > 0) {
    const repliesContainer = document.createElement('div');
    repliesContainer.className = 'replies-container';
    
    comment.replies.forEach(reply => {
      const replyElement = createReplyElement(reply);
      repliesContainer.appendChild(replyElement);
    });
    
    commentElement.appendChild(repliesContainer);
  }
  
  return commentElement;
}

// Function to create a reply element
function createReplyElement(reply) {
  const replyElement = document.createElement('div');
  replyElement.className = 'reply';
  replyElement.dataset.replyId = reply.id;
  
  let deleteButton = '';
  if (reply.isCurrentUser) {
    deleteButton = `
      <button class="comment-action delete-action">
        <i class="far fa-trash-alt"></i> Delete
      </button>
    `;
  }
  
  replyElement.innerHTML = `
    <div class="comment-avatar">
      <img src="${reply.avatar}" alt="${reply.author}">
    </div>
    <div class="comment-content">
      <div class="comment-author">${reply.author}</div>
      <div class="comment-time">${reply.time}</div>
      <div class="comment-text">${reply.text}</div>
      <div class="comment-actions-row">
        <button class="comment-action like-action">
          <i class="far fa-thumbs-up"></i> ${reply.likes}
        </button>
        ${deleteButton}
      </div>
    </div>
  `;
  
  return replyElement;
}

// Function to set up comment input
function setupCommentInput() {
  const commentInput = document.getElementById('comment-input');
  const commentActions = document.getElementById('comment-actions');
  const commentButton = document.querySelector('.btn-comment');
  const cancelButton = document.querySelector('.btn-cancel');
  
  if (commentInput && commentActions) {
    // Show actions when input is focused
    commentInput.addEventListener('focus', function() {
      commentActions.style.display = 'flex';
    });
    
    // Submit comment when comment button is clicked
    if (commentButton) {
      commentButton.addEventListener('click', function() {
        submitComment();
      });
    }
    
    // Cancel comment when cancel button is clicked
    if (cancelButton) {
      cancelButton.addEventListener('click', function() {
        commentInput.value = '';
        commentActions.style.display = 'none';
        commentInput.blur();
      });
    }
    
    // Submit comment when Enter key is pressed (with Shift for new line)
    commentInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitComment();
      }
    });
  }
}

// Function to submit a new comment
function submitComment() {
  const commentInput = document.getElementById('comment-input');
  const commentText = commentInput.value.trim();
  
  if (commentText) {
    // Add the comment to the list
    addComment(commentText);
    
    // Clear the input and hide actions
    commentInput.value = '';
    document.getElementById('comment-actions').style.display = 'none';
    commentInput.blur();
  }
}

// Function to add a new comment to the list
function addComment(text) {
  const commentsList = document.querySelector('.comments-list');
  const allCommentsList = document.querySelector('.all-comments-list');
  
  // Create a new comment element
  const commentId = Date.now(); // Use timestamp as ID
  const comment = {
    id: commentId,
    author: 'You',
    avatar: '../img/avatars/user.jpg',
    time: 'Just now',
    text: text,
    isCurrentUser: true,
    likes: 0,
    replies: []
  };
  
  // Create comment for main list
  const commentElement = createCommentElement(comment);
  
  // Add the comment to the top of the list
  if (commentsList.firstChild) {
    commentsList.insertBefore(commentElement, commentsList.firstChild);
  } else {
    commentsList.appendChild(commentElement);
  }
  
  // Add the comment to the modal list if it exists
  if (allCommentsList) {
    const modalCommentElement = createCommentElement(comment);
    if (allCommentsList.firstChild) {
      allCommentsList.insertBefore(modalCommentElement, allCommentsList.firstChild);
    } else {
      allCommentsList.appendChild(modalCommentElement);
    }
  }
  
  // Set up comment actions
  setupCommentActions();
}

// Function to set up modals
function setupModals() {
  const modalButtons = document.querySelectorAll('.see-all-btn[data-modal]');
  const closeButtons = document.querySelectorAll('.close-modal');
  
  // Open modal when see all button is clicked
  modalButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modalId = this.dataset.modal;
      const modal = document.getElementById(modalId);
      
      if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
      }
    });
  });
  
  // Close modal when close button is clicked
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
  });
  
  // Close modal when clicking outside the content
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
      document.body.style.overflow = ''; // Restore scrolling
    }
  });
}

// Function to set up title like/dislike buttons
function setupTitleActions() {
  const likeBtn = document.querySelector('.title-like-btn');
  const dislikeBtn = document.querySelector('.title-dislike-btn');
  
  if (likeBtn && dislikeBtn) {
      likeBtn.addEventListener('click', function() {
          if (this.classList.contains('active')) {
              // Un-like
              this.classList.remove('active');
              const countElement = this.querySelector('.like-count');
              if (countElement) {
                  // Decrease count (simplified for demo)
                  let count = countElement.textContent;
                  if (count.endsWith('K')) {
                      countElement.textContent = '1.4K';
                  }
              }
          } else {
              // Like
              this.classList.add('active');
              dislikeBtn.classList.remove('active');
              const countElement = this.querySelector('.like-count');
              if (countElement) {
                  // Increase count (simplified for demo)
                  let count = countElement.textContent;
                  if (count.endsWith('K')) {
                      countElement.textContent = '1.5K';
                  }
              }
          }
      });
      
      dislikeBtn.addEventListener('click', function() {
          if (this.classList.contains('active')) {
              // Un-dislike
              this.classList.remove('active');
          } else {
              // Dislike
              this.classList.add('active');
              likeBtn.classList.remove('active');
              const countElement = likeBtn.querySelector('.like-count');
              if (countElement) {
                  // Decrease count (simplified for demo)
                  let count = countElement.textContent;
                  if (count.endsWith('K')) {
                      countElement.textContent = '1.4K';
                  }
              }
          }
      });
  }
}

// Function to set up comment actions (like, reply, delete)
function setupCommentActions() {
  // Set up like buttons
  const likeButtons = document.querySelectorAll('.comment-action.like-action');
  likeButtons.forEach(button => {
    button.addEventListener('click', function() {
      toggleLike(this);
    });
  });
  
  // Set up reply buttons
  const replyButtons = document.querySelectorAll('.comment .comment-action.reply-action');
  replyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const comment = this.closest('.comment');
      if (comment) {
        const commentId = comment.dataset.commentId;
        toggleReplyForm(commentId);
      }
    });
  });
  
  // Set up delete buttons for comments
  const commentDeleteButtons = document.querySelectorAll('.comment > .comment-content .delete-action');
  commentDeleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const comment = this.closest('.comment');
      deleteComment(comment);
    });
  });
  
  // Set up delete buttons for replies
  const replyDeleteButtons = document.querySelectorAll('.reply .delete-action');
  replyDeleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const reply = this.closest('.reply');
      deleteComment(reply);
    });
  });
}

// Function to toggle like on a comment
function toggleLike(button) {
  if (button.classList.contains('active')) {
    // Unlike
    button.classList.remove('active');
    const text = button.textContent.trim();
    const count = parseInt(text);
    if (!isNaN(count) && count > 0) {
      button.innerHTML = `<i class="far fa-thumbs-up"></i> ${count - 1}`;
    }
  } else {
    // Like
    button.classList.add('active');
    const text = button.textContent.trim();
    const count = parseInt(text);
    if (!isNaN(count)) {
      button.innerHTML = `<i class="far fa-thumbs-up"></i> ${count + 1}`;
    } else {
      button.innerHTML = `<i class="far fa-thumbs-up"></i> 1`;
    }
  }
}

// Function to toggle reply form visibility
function toggleReplyForm(commentId) {
  const comment = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
  
  if (!comment) return;
  
  let replyForm = comment.querySelector('.reply-form');
  
  if (replyForm) {
    // Toggle existing form
    if (replyForm.style.display === 'block') {
      replyForm.style.display = 'none';
    } else {
      replyForm.style.display = 'block';
      replyForm.querySelector('textarea').focus();
    }
  } else {
    // Create new reply form
    replyForm = createReplyForm(commentId);
    comment.appendChild(replyForm);
    replyForm.style.display = 'block';
    replyForm.querySelector('textarea').focus();
  }
}

// Function to create a reply form
function createReplyForm(commentId) {
  const replyForm = document.createElement('div');
  replyForm.className = 'reply-form';
  replyForm.innerHTML = `
    <textarea placeholder="Write a reply..."></textarea>
    <div class="reply-actions">
      <button class="btn-reply-cancel">Cancel</button>
      <button class="btn-reply-submit">Reply</button>
    </div>
  `;
  
  // Set up cancel button
  replyForm.querySelector('.btn-reply-cancel').addEventListener('click', function() {
    replyForm.style.display = 'none';
  });
  
  // Set up submit button
  replyForm.querySelector('.btn-reply-submit').addEventListener('click', function() {
    const replyText = replyForm.querySelector('textarea').value.trim();
    if (replyText) {
      submitReply(commentId, replyText);
      replyForm.style.display = 'none';
    }
  });
  
  return replyForm;
}

// Function to submit a reply
function submitReply(commentId, replyText) {
  const comment = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
  
  // Check if replies container exists, create if not
  let repliesContainer = comment.querySelector('.replies-container');
  if (!repliesContainer) {
    repliesContainer = document.createElement('div');
    repliesContainer.className = 'replies-container';
    comment.appendChild(repliesContainer);
  }
  
  // Create new reply
  const replyId = Date.now(); // Use timestamp as temporary ID
  const reply = {
    id: replyId,
    author: 'You',
    avatar: '../img/avatars/user.jpg',
    time: 'Just now',
    text: replyText,
    isCurrentUser: true,
    likes: 0
  };
  
  const replyElement = createReplyElement(reply);
  repliesContainer.appendChild(replyElement);
  
  // Also update the modal if it exists
  const modalComment = document.querySelector(`.all-comments-list .comment[data-comment-id="${commentId}"]`);
  if (modalComment) {
    let modalRepliesContainer = modalComment.querySelector('.replies-container');
    if (!modalRepliesContainer) {
      modalRepliesContainer = document.createElement('div');
      modalRepliesContainer.className = 'replies-container';
      modalComment.appendChild(modalRepliesContainer);
    }
    
    const modalReplyElement = createReplyElement(reply);
    modalRepliesContainer.appendChild(modalReplyElement);
  }
  
  // Set up comment actions
  setupCommentActions();
}

// Function to delete a comment or reply
function deleteComment(commentElement) {
  if (confirm('Are you sure you want to delete this comment?')) {
    // If it's a comment, also remove it from the modal
    if (commentElement.classList.contains('comment')) {
      const commentId = commentElement.dataset.commentId;
      const modalComment = document.querySelector(`.all-comments-list .comment[data-comment-id="${commentId}"]`);
      if (modalComment) {
        modalComment.remove();
      }
      commentElement.remove();
    }
    
    // If it's a reply, only remove the reply (not the parent comment)
    if (commentElement.classList.contains('reply')) {
      const replyId = commentElement.dataset.replyId;
      
      // Find and remove the corresponding reply in the modal
      const modalReply = document.querySelector(`.all-comments-list .reply[data-reply-id="${replyId}"]`);
      if (modalReply) {
        modalReply.remove();
      }
      
      // Only remove the reply element itself
      commentElement.remove();
    }
  }
}