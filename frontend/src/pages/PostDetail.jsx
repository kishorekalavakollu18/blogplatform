import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { parseMarkdown } from '../components/RichTextEditor';
import CommentSection from '../components/CommentSection';
import { Heart, Calendar, Edit, Trash2, ArrowLeft } from 'lucide-react';
import './Pages.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Likes local state
  const [likes, setLikes] = useState([]);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await api.getPost(id);
        if (data.success) {
          setPost(data.post);
          setLikes(data.post.likes || []);
          if (user) {
            setLiked((data.post.likes || []).includes(user._id));
          }
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError('Error loading post details');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const data = await api.toggleLike(id);
      if (data.success) {
        setLikes(data.likes);
        setLiked(data.liked);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this story? This cannot be undone.')) return;

    try {
      const data = await api.deletePost(id);
      if (data.success) {
        navigate('/');
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch (err) {
      alert('Error deleting post');
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="error-message card">{error}</div>;
  if (!post) return <div className="error-message card">Story not found.</div>;

  const isAuthor = user && post.author?._id === user._id;
  const isAdmin = user && user.role === 'admin';
  const canModify = isAuthor || isAdmin;

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="post-detail-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Back to stories
      </Link>

      <header className="post-header">
        <div className="post-meta-top">
          <span className="post-category-badge">{post.category}</span>
          <span className="post-date-wrapper">
            <Calendar size={14} />
            {formattedDate}
          </span>
        </div>

        <h1 className="post-detail-title">{post.title}</h1>

        <div className="post-author-row">
          <div className="author-info-block">
            {post.author?.profilePicture ? (
              <img src={post.author.profilePicture} alt={post.author.name} className="author-large-avatar" />
            ) : (
              <div className="author-large-avatar-placeholder">
                {post.author?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <div className="author-name-text">{post.author?.name || 'Anonymous'}</div>
              <div className="author-role-subtext">Writer</div>
            </div>
          </div>

          <div className="post-actions-wrapper">
            <button 
              className={`btn-like ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              title={liked ? "Unlike this story" : "Like this story"}
            >
              <Heart size={18} className={liked ? 'heart-filled' : ''} />
              <span>{likes.length}</span>
            </button>

            {canModify && (
              <div className="post-edit-actions">
                <Link to={`/edit/${post._id}`} className="btn btn-secondary edit-btn" title="Edit story">
                  <Edit size={16} />
                  <span>Edit</span>
                </Link>
                <button className="btn btn-danger delete-btn" onClick={handleDelete} title="Delete story">
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {post.coverImage && (
        <div className="post-cover-image-container">
          <img src={post.coverImage} alt={post.title} className="post-detail-cover" />
        </div>
      )}

      <div className="post-summary-quote card">
        <p>{post.summary}</p>
      </div>

      <article 
        className="post-content-body rich-content"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
      />

      <CommentSection postId={post._id} postAuthorId={post.author?._id} />
    </div>
  );
};

export default PostDetail;
