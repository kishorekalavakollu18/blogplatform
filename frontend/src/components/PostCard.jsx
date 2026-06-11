import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, ArrowUpRight } from 'lucide-react';
import './PostCard.css';

const PostCard = ({ post }) => {
  const { _id, title, summary, coverImage, author, category, createdAt, likes = [] } = post;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className="card post-card">
      <div className="post-card-image-wrapper">
        {coverImage ? (
          <img src={coverImage} alt={title} className="post-card-image" />
        ) : (
          <div className="post-card-placeholder-image">
            <span>✍️</span>
          </div>
        )}
        <span className="post-card-category">{category}</span>
      </div>

      <div className="post-card-body">
        <div className="post-card-meta">
          <span className="post-card-date">
            <Calendar size={14} />
            {formattedDate}
          </span>
          <span className="post-card-likes">
            <Heart size={14} className={likes.length > 0 ? "liked-icon-active" : ""} />
            {likes.length} {likes.length === 1 ? 'like' : 'likes'}
          </span>
        </div>

        <Link to={`/post/${_id}`}>
          <h3 className="post-card-title">{title}</h3>
        </Link>
        
        <p className="post-card-summary">{summary}</p>

        <div className="post-card-footer">
          <div className="post-card-author">
            {author?.profilePicture ? (
              <img src={author.profilePicture} alt={author.name} className="author-avatar" />
            ) : (
              <div className="author-avatar-placeholder">{author?.name?.[0].toUpperCase() || 'U'}</div>
            )}
            <span className="author-name">{author?.name || 'Anonymous'}</span>
          </div>

          <Link to={`/post/${_id}`} className="read-more-link">
            <span>Read</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
