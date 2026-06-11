import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import { ChevronLeft, ChevronRight, SlidersHorizontal, BookOpen } from 'lucide-react';
import './Pages.css';

const CATEGORIES = ['All', 'Technology', 'Lifestyle', 'Travel', 'Business', 'Food', 'General'];

const Home = ({ searchQuery }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('All');
  const [totalPosts, setTotalPosts] = useState(0);

  // Reset page when search query or category changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, category]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await api.getPosts({
          page,
          limit: 6,
          search: searchQuery,
          category
        });

        if (data.success) {
          setPosts(data.posts);
          setTotalPages(data.totalPages);
          setTotalPosts(data.totalPosts);
        } else {
          setError('Failed to fetch posts');
        }
      } catch (err) {
        setError('Error connecting to API');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, searchQuery, category]);

  return (
    <div className="home-page-container">
      {/* Hero Header */}
      <section className="hero-section card">
        <div className="hero-content">
          <h1 className="hero-title">Discover stories, thinking, and expertise.</h1>
          <p className="hero-subtitle">A place to write, read, and connect with creative minds.</p>
        </div>
      </section>

      {/* Categories Bar */}
      <div className="filter-bar">
        <div className="category-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="spinner"></div>
      ) : error ? (
        <div className="error-message card">{error}</div>
      ) : posts.length === 0 ? (
        <div className="empty-state card">
          <BookOpen size={48} />
          <h3>No stories found</h3>
          <p>We couldn't find any stories matching your filters. Try selecting another category or refining your search term.</p>
        </div>
      ) : (
        <>
          <div className="posts-count">
            Showing {posts.length} of {totalPosts} stories
          </div>
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <button
                className="btn btn-secondary paging-btn"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              
              <span className="paging-info">
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-secondary paging-btn"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
