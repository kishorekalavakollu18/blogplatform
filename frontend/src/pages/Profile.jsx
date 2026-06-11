import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import { User, Mail, Camera, BookOpen, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Pages.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState('');

  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Sync user context state
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPicturePreview(user.profilePicture || '');
    }
  }, [user]);

  // Load user posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;
      try {
        const data = await api.getPosts({ author: user._id, limit: 20 });
        if (data.success) {
          setMyPosts(data.posts);
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPicturePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    if (password) {
      formData.append('password', password);
    }
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const data = await updateProfile(formData);
      if (data.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setPassword('');
      } else {
        setMessage({ text: data.message || 'Failed to update profile.', type: 'danger' });
      }
    } catch (err) {
      setMessage({ text: 'Error connecting to database.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;

    try {
      const data = await api.deletePost(id);
      if (data.success) {
        setMyPosts(prev => prev.filter(post => post._id !== id));
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch (err) {
      alert('Error deleting post');
    }
  };

  if (!user) return <div className="spinner"></div>;

  return (
    <div className="profile-page-container">
      <div className="profile-layout-split">
        {/* Profile configuration card */}
        <div className="profile-column-sidebar">
          <div className="card profile-config-card">
            <h2 className="profile-card-title">My Profile</h2>
            <p className="profile-card-subtitle">Manage your personal settings and profile information.</p>
            
            {message.text && (
              <div className={`error-message auth-error ${message.type === 'success' ? 'success-msg' : ''}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="profile-form">
              <div className="avatar-upload-block">
                <div className="avatar-preview-container">
                  {picturePreview ? (
                    <img src={picturePreview} alt={name} className="profile-avatar-large" />
                  ) : (
                    <div className="profile-avatar-large-placeholder">{name[0]?.toUpperCase()}</div>
                  )}
                  <label className="avatar-camera-btn" title="Upload new photo">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="file-hidden-input"
                    />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input auth-input-inner"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input auth-input-inner"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-password">Update Password (Leave blank to keep current)</label>
                <input
                  id="profile-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Saving...' : 'Update Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* User's posts column */}
        <div className="profile-column-main">
          <h3 className="section-title-my-stories">My Stories</h3>

          {postsLoading ? (
            <div className="spinner"></div>
          ) : myPosts.length === 0 ? (
            <div className="empty-state card">
              <BookOpen size={48} />
              <h3>Write your first story</h3>
              <p>You haven't published any stories yet. Share your knowledge or thoughts with our readers!</p>
              <Link to="/create" className="btn btn-primary" style={{ marginTop: '16px' }}>Create Post</Link>
            </div>
          ) : (
            <div className="my-posts-list">
              {myPosts.map((post) => (
                <div key={post._id} className="card my-post-card-row">
                  <div className="my-post-info">
                    {post.coverImage && (
                      <img src={post.coverImage} alt={post.title} className="my-post-row-thumb" />
                    )}
                    <div>
                      <h4 className="my-post-row-title">
                        <Link to={`/post/${post._id}`}>{post.title}</Link>
                      </h4>
                      <p className="my-post-row-date">Published on {new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="my-post-row-actions">
                    <Link to={`/edit/${post._id}`} className="btn btn-secondary btn-sm" title="Edit story">
                      <Edit size={14} />
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeletePost(post._id)} title="Delete story">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
