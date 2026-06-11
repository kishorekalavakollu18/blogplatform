import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import { Upload, FileText, ArrowLeft, Tag } from 'lucide-react';
import './Pages.css';

const CATEGORIES = ['General', 'Technology', 'Lifestyle', 'Travel', 'Business', 'Food'];

const CreateEditPost = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Fetch post details if in Edit Mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchPostDetails = async () => {
      setFetching(true);
      try {
        const data = await api.getPost(id);
        if (data.success) {
          setTitle(data.post.title);
          setSummary(data.post.summary);
          setContent(data.post.content);
          setCategory(data.post.category || 'General');
          setTags((data.post.tags || []).join(', '));
          setImagePreview(data.post.coverImage || '');
        } else {
          setError('Could not load post details');
        }
      } catch (err) {
        setError('Error loading post details');
      } finally {
        setFetching(false);
      }
    };

    fetchPostDetails();
  }, [id, isEditMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !summary.trim()) {
      setError('Title, summary, and content are required.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('summary', summary.trim());
    formData.append('content', content);
    formData.append('category', category);
    formData.append('tags', tags);
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    try {
      let data;
      if (isEditMode) {
        data = await api.updatePost(id, formData);
      } else {
        data = await api.createPost(formData);
      }

      if (data.success) {
        navigate(`/post/${data.post._id}`);
      } else {
        setError(data.message || 'Failed to save post.');
      }
    } catch (err) {
      setError('Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="spinner"></div>;

  return (
    <div className="create-post-container">
      <button onClick={() => navigate(-1)} className="back-link btn-back-plain">
        <ArrowLeft size={16} />
        Go Back
      </button>

      <div className="form-header">
        <h1 className="form-title">{isEditMode ? 'Edit Your Story' : 'Write a New Story'}</h1>
        <p className="form-subtitle">Share your insights, guides, or creative writing with the community.</p>
      </div>

      {error && <div className="error-message card">{error}</div>}

      <form className="create-post-form" onSubmit={handleSubmit}>
        <div className="form-layout-split">
          {/* Main content column */}
          <div className="form-column-main">
            <div className="form-group">
              <label className="form-label" htmlFor="post-title">Story Title</label>
              <input
                id="post-title"
                type="text"
                placeholder="Enter a catchy title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input title-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Story Content (Markdown Supported)</label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Once upon a time..."
              />
            </div>
          </div>

          {/* Sidebar configuration column */}
          <div className="form-column-sidebar">
            <div className="card sidebar-config-card">
              <h3 className="sidebar-card-title">Settings</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="post-category">Category</label>
                <select
                  id="post-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="post-tags">Tags (Comma-separated)</label>
                <div className="tag-input-container">
                  <Tag size={16} className="tag-icon" />
                  <input
                    id="post-tags"
                    type="text"
                    placeholder="react, webdev, js"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="form-input tag-input-inner"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="post-summary">Short Summary (max 300 chars)</label>
                <textarea
                  id="post-summary"
                  placeholder="Provide a brief summary of this story..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="form-input summary-textarea"
                  maxLength={300}
                  rows={4}
                  required
                />
                <span className="char-count">{summary.length}/300</span>
              </div>

              <div className="form-group">
                <label className="form-label">Cover Image</label>
                <div className="cover-upload-area">
                  {imagePreview ? (
                    <div className="image-preview-wrapper">
                      <img src={imagePreview} alt="Cover preview" className="image-preview-thumb" />
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm remove-img-btn"
                        onClick={() => { setCoverImage(null); setImagePreview(''); }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="upload-placeholder">
                      <Upload size={24} />
                      <span>Upload image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-hidden-input"
                      />
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block submit-story-btn"
                disabled={loading}
              >
                {loading ? 'Publishing...' : isEditMode ? 'Save Changes' : 'Publish Story'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditPost;
