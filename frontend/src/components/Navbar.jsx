import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Edit3, LogOut, User as UserIcon, Shield, Search, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onSearchChange }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchInput);
    }
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="header-glass navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => { setSearchInput(''); if (onSearchChange) onSearchChange(''); }}>
          <span>✍️</span>
          <span className="logo-text">PenCraft</span>
        </Link>

        <form className="nav-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search stories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <Search size={18} />
          </button>
        </form>

        <div className="nav-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <div className="user-nav-links">
              <Link to="/create" className="btn btn-primary nav-write-btn">
                <Edit3 size={16} />
                <span>Write</span>
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" className="admin-link" title="Admin Dashboard">
                  <Shield size={20} />
                </Link>
              )}

              <div className="profile-dropdown-wrapper">
                <button className="avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="nav-avatar" />
                  ) : (
                    <div className="nav-avatar-placeholder">{user.name[0].toUpperCase()}</div>
                  )}
                </button>

                {menuOpen && (
                  <div className="dropdown-menu card">
                    <div className="dropdown-header">
                      <span className="dropdown-name">{user.name}</span>
                      <span className="dropdown-email">{user.email}</span>
                    </div>
                    <hr className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      <UserIcon size={16} />
                      Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                        <Shield size={16} />
                        Admin Panel
                      </Link>
                    )}
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-nav-links">
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}

          <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer card">
          <form className="mobile-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn btn-primary">Go</button>
          </form>

          {user ? (
            <>
              <div className="mobile-user-info">
                <span>Logged in as <strong>{user.name}</strong></span>
              </div>
              <Link to="/create" className="mobile-drawer-item" onClick={() => setMenuOpen(false)}>Create Post</Link>
              <Link to="/profile" className="mobile-drawer-item" onClick={() => setMenuOpen(false)}>My Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="mobile-drawer-item" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
              <button className="btn btn-danger mobile-logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <div className="mobile-auth-actions">
              <Link to="/login" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
