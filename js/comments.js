/**
 * comments.js - Functionality for the comments section
 *
 * Handles all comments-related functionality including:
 * - Loading and displaying comments
 * - Creating comment and reply elements
 * - Setting up comment input and form handling
 * - Like, reply, and delete actions
 * - Integration with Telegram user account for authoring comments
 */

// Track if we've verified Telegram integration
let telegramUserVerified = false;
let cachedTelegramUser = null;
let telegramInitAttempts = 0;
const MAX_TELEGRAM_INIT_ATTEMPTS = 10;

// Initialize comments functionality when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing comments module');
    
    // Start immediate verification attempts
    tryInitTelegram();
    
    // Set up comment functionality
    setupCommentInput();
    loadComments();
});

// Try to initialize Telegram with multiple attempts
function tryInitTelegram() {
    console.log(`Telegram init attempt ${telegramInitAttempts + 1}/${MAX_TELEGRAM_INIT_ATTEMPTS}`);
    
    // Try to verify immediately
    verifyTelegramUser();
    
    // If not verified, try again until max attempts
    if (!telegramUserVerified && telegramInitAttempts < MAX_TELEGRAM_INIT_ATTEMPTS) {
        telegramInitAttempts++;
        setTimeout(tryInitTelegram, 500); // Try every 500ms
    }
}

// Verify and cache Telegram user data
function verifyTelegramUser() {
    // Try direct access to Telegram WebApp first - most reliable
    if (window.Telegram && window.Telegram.WebApp) {
        const webAppUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (webAppUser) {
            cachedTelegramUser = {
                id: webAppUser.id,
                name: webAppUser.first_name + (webAppUser.last_name ? ` ${webAppUser.last_name}` : ''),
                username: webAppUser.username || `user${webAppUser.id}`
            };
            
            telegramUserVerified = true;
            console.log('SUCCESS: Telegram user verified directly:', cachedTelegramUser.name, 'ID:', cachedTelegramUser.id);
            
            // Update any existing comments with the proper username if needed
            updateExistingComments();
            return true;
        }
    }
    
    // Try fallback to telegramApp if direct access failed
    if (window.telegramApp && window.telegramApp.user) {
        const user = window.telegramApp.user;
        cachedTelegramUser = {
            id: user.id,
            name: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
            username: user.username || `user${user.id}`
        };
        
        telegramUserVerified = true;
        console.log('SUCCESS: Telegram user verified via telegramApp:', cachedTelegramUser.name, 'ID:', cachedTelegramUser.id);
        
        // Update any existing comments with the proper username if needed
        updateExistingComments();
        return true;
    }
    
    console.log('Could not verify Telegram user this attempt, will retry');
    return false;
}

// Update any existing comments from "You" to the proper username
function updateExistingComments() {
    if (!cachedTelegramUser) return;
    
    const yourComments = document.querySelectorAll('.comment-author');
    yourComments.forEach(author => {
        if (author.textContent === 'You') {
            author.textContent = cachedTelegramUser.name;
        }
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
      avatar: "/img/avatars/user1.jpg",
      time: "2 hours ago",
      text: "This movie was absolutely mind-blowing! The concept of dream invasion is so unique.",
      isCurrentUser: false,
      likes: 24,
      replies: []
    },
    {
      id: 2,
      author: "You",
      avatar: "/img/avatars/user.jpg",
      time: "1 hour ago",
      text: "I loved the visual effects and the soundtrack. Hans Zimmer did an amazing job!",
      isCurrentUser: true,
      likes: 12,
      replies: []
    }
    // Add more comments as needed
  ];
  
  // Only load a limited number of comments to prevent too many file requests
  const commentsToShow = Math.min(comments.length, 5);
  
  // Render each comment
  for (let i = 0; i < commentsToShow; i++) {
    const comment = comments[i];
    
    // Create comment for main list
    const commentElement = createCommentElement(comment);
    commentsList.appendChild(commentElement);
    
    // Create comment for modal list if it exists
    if (allCommentsList) {
      const modalCommentElement = createCommentElement(comment);
      allCommentsList.appendChild(modalCommentElement);
    }
  }
  
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
  
  // Create the HTML without avatar
  commentElement.innerHTML = `
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
    
    // Only load a limited number of replies to prevent too many file requests
    const repliesToShow = Math.min(comment.replies.length, 3);
    
    for (let i = 0; i < repliesToShow; i++) {
      const reply = comment.replies[i];
      const replyElement = createReplyElement(reply);
      repliesContainer.appendChild(replyElement);
    }
    
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

// Function to get current user from Telegram
function getCurrentTelegramUser(forceCheck = false) {
    // Return cached user if already verified (unless forced check)
    if (!forceCheck && cachedTelegramUser) {
        return cachedTelegramUser;
    }
    
    // If not verified yet, force another verification attempt
    if (!telegramUserVerified) {
        verifyTelegramUser();
    }
    
    // If we have cached user after verification, return it
    if (cachedTelegramUser) {
        return cachedTelegramUser;
    }
    
    // If initialized in browser (no Telegram), generate fake data
    // This is just for demo purposes
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return {
            id: 'browser-test-user',
            name: 'Test User',
            username: 'test_user'
        };
    }
    
    // Last fallback to default user if everything fails
    return {
        id: 'local-user',
        name: 'You',
        username: 'local_user'
    };
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
      
      // Try verifying one more time on focus, in case it's loaded by now
      if (!telegramUserVerified) {
        verifyTelegramUser();
      }
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
        // If not verified yet, try one more time
        if (!telegramUserVerified) {
            verifyTelegramUser();
        }
        
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
    
    // Force another verification attempt before posting
    if (!telegramUserVerified) {
        verifyTelegramUser();
    }
    
    // Get current user info from Telegram
    const telegramUser = getCurrentTelegramUser();
    
    // Create a new comment element
    const commentId = Date.now(); // Use timestamp as ID
    const comment = {
        id: commentId,
        author: telegramUser.name,
        time: 'Just now',
        text: text,
        isCurrentUser: true,
        likes: 0,
        replies: [],
        telegramUserId: telegramUser.id,
        telegramUsername: telegramUser.username
    };
    
    console.log('Posting comment from Telegram user:', telegramUser.name, 'ID:', telegramUser.id);
    
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
    
    // Set up comment actions to ensure all interactive elements work
    setupCommentActions();
    
    // In a real application, you would send this to your backend API
    // along with the Telegram user ID for persistence
    console.log('Comment would be sent to API with Telegram user ID:', telegramUser.id);
}

// Function to set up comment actions (like, reply, delete)
function setupCommentActions() {
  // Set up like buttons (for both comments and replies)
  const likeButtons = document.querySelectorAll('.comment-action.like-action');
  likeButtons.forEach(button => {
    // Remove existing event listener to prevent duplicates
    button.removeEventListener('click', likeButtonHandler);
    // Add new event listener
    button.addEventListener('click', likeButtonHandler);
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

// Handler function for like button clicks
function likeButtonHandler() {
  toggleLike(this);
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
            // Try to verify one last time before submitting
            if (!telegramUserVerified) {
                verifyTelegramUser();
            }
            
            submitReply(commentId, replyText);
            replyForm.style.display = 'none';
        }
    });
    
    return replyForm;
}

// Function to submit a reply
function submitReply(commentId, replyText) {
    const comment = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
    
    // Force another verification attempt before posting the reply
    if (!telegramUserVerified) {
        verifyTelegramUser();
    }
    
    // Get current user info from Telegram
    const telegramUser = getCurrentTelegramUser();
    
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
        author: telegramUser.name,
        time: 'Just now',
        text: replyText,
        isCurrentUser: true,
        likes: 0,
        telegramUserId: telegramUser.id,
        telegramUsername: telegramUser.username
    };
    
    console.log('Posting reply from Telegram user:', telegramUser.name, 'ID:', telegramUser.id);
    
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
    
    // Set up comment actions to ensure new like buttons work
    setupCommentActions();
    
    // In a real application, you would send this to your backend API
    // along with the Telegram user ID for persistence
    console.log('Reply would be sent to API with Telegram user ID:', telegramUser.id);
}

// Function to delete a comment or reply
function deleteComment(commentElement) {
  const commentId = commentElement.dataset.commentId;
  const replyId = commentElement.dataset.replyId;
  
  if (commentId) {
    console.log('Deleting comment with ID:', commentId);
    
    // In a real app, you would make an API call to delete the comment
    // For demo purposes, we'll just remove the element from the DOM
    
    // Check if we need to remove from the modal as well
    const modalComment = document.querySelector(`.all-comments-list .comment[data-comment-id="${commentId}"]`);
    if (modalComment) {
      modalComment.remove();
    }
    
    // Remove the comment element itself
    commentElement.remove();
  } else if (replyId) {
    console.log('Deleting reply with ID:', replyId);
    
    // Check if we need to remove from the modal as well
    const modalReply = document.querySelector(`.all-comments-list .reply[data-reply-id="${replyId}"]`);
    if (modalReply) {
      modalReply.remove();
    }
    
    // Remove the reply element itself
    commentElement.remove();
  }
}

// Export functions for use in other modules
window.CommentsModule = {
    loadComments,
    setupCommentInput,
    setupCommentActions,
    addComment,
    submitComment,
    createCommentElement,
    getCurrentTelegramUser,
    verifyTelegramUser,
    updateExistingComments
}; 