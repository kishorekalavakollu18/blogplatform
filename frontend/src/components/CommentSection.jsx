import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trash2, Send } from 'lucide-react';
import './CommentSection.css';

const CommentSection = ({ postId, postAuthorId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await api.getComments(postId);
        if (data.success) {
          setComments(data.comments);
        } else {
          setError('Failed to load comments');
        }
      } catch (err) {
        setError('Error loading comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const data = await api.addComment(postId, newComment.trim());
      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      } else {
        setError(data.message || 'Failed to submit comment');
      }
    } catch (err) {
      setError('Error submitting comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const data = await api.deleteComment(commentId);
      if (data.success) {
        setComments(prev => prev.filter(c => c._id !== commentId));
      } else {
        alert(data.message || 'Failed to delete comment');
      }
    } catch (err) {
      alert('Error deleting comment');
    }
  };

  return (
    <div className="comment-section-container">
      <h3 className="comment-title">Comments ({comments.length})</h3>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-input-wrapper">
            <textarea
              placeholder="Join the discussion... write a comment."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="form-input comment-textarea"
              rows={3}
              required
            />
            <button type="submit" className="btn btn-primary comment-submit-btn">
              <Send size={16} />
              <span>Comment</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt card">
          <p>Please log in to add comments to this post.</p>
        </div>
      )}

      {error && <div className="comment-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : comments.length === 0 ? (
        <div className="no-comments">No comments yet. Be the first to start the conversation!</div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => {
            const isCommentAuthor = user && comment.author?._id === user._id;
            const isPostAuthor = user && postAuthorId === user._id;
            const isAdmin = user && user.role === 'admin';
            const canDelete = isCommentAuthor || isPostAuthor || isAdmin;

            const commentDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={comment._id} className="comment-card card">
                <div className="comment-header">
                  <div className="comment-author-info">
                    {comment.author?.profilePicture ? (
                      <img src={comment.author.profilePicture} alt={comment.author.name} className="comment-avatar" />
                    ) : (
                      <div className="comment-avatar-placeholder">
                        {comment.author?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="comment-author-name">
                        {comment.author?.name || 'Anonymous'}
                        {comment.author?._id === postAuthorId && <span className="author-badge">Author</span>}
                      </div>
                      <div className="comment-date">{commentDate}</div>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      className="comment-delete-btn"
                      onClick={() => handleDelete(comment._id)}
                      title="Delete comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="comment-text">{comment.text}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
