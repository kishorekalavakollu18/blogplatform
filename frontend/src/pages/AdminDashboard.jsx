import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, FileText, MessageSquare, Shield, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import './Pages.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'users'

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsData = await api.getStats();
        const usersData = await api.getUsers();

        if (statsData.success && usersData.success) {
          setStats(statsData.stats);
          setUsers(usersData.users);
        } else {
          setError(statsData.message || usersData.message || 'Failed to load administrative panels.');
        }
      } catch (err) {
        setError('Error loading administrative data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change user role to ${nextRole}?`)) return;

    try {
      const data = await api.updateUserRole(userId, nextRole);
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: nextRole } : u));
      } else {
        alert(data.message || 'Failed to update user role.');
      }
    } catch (err) {
      alert('Error updating user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Deleting this user will delete all of their published stories and comments. Are you absolutely sure?')) return;

    try {
      const data = await api.deleteUser(userId);
      if (data.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        // Refresh stats
        const statsData = await api.getStats();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      } else {
        alert(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Error deleting user.');
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="error-message card">{error}</div>;

  return (
    <div className="admin-dashboard-container">
      <div className="form-header">
        <h1 className="form-title">Admin Dashboard</h1>
        <p className="form-subtitle">Monitor posts, manage users, and view platform analytics.</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Overview Stats
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users ({users.length})
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="admin-stats-panel">
          {/* Card stats grid */}
          <div className="stats-cards-grid">
            <div className="card stat-widget">
              <div className="stat-widget-icon user-widget">
                <Users size={24} />
              </div>
              <div className="stat-widget-info">
                <span className="stat-number">{stats.totalUsers}</span>
                <span className="stat-label">Total Registered Users</span>
              </div>
            </div>

            <div className="card stat-widget">
              <div className="stat-widget-icon post-widget">
                <FileText size={24} />
              </div>
              <div className="stat-widget-info">
                <span className="stat-number">{stats.totalPosts}</span>
                <span className="stat-label">Total Published Posts</span>
              </div>
            </div>

            <div className="card stat-widget">
              <div className="stat-widget-icon comment-widget">
                <MessageSquare size={24} />
              </div>
              <div className="stat-widget-info">
                <span className="stat-number">{stats.totalComments}</span>
                <span className="stat-label">Total Written Comments</span>
              </div>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="admin-breakdown-row">
            <div className="card breakdown-card">
              <h3 className="breakdown-title">Posts By Category</h3>
              <div className="breakdown-list">
                {stats.categoriesCount && stats.categoriesCount.length > 0 ? (
                  stats.categoriesCount.map((cat) => (
                    <div key={cat._id} className="breakdown-item">
                      <span className="breakdown-label-text">{cat._id}</span>
                      <span className="breakdown-badge">{cat.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-breakdown">No categorical posts written yet.</div>
                )}
              </div>
            </div>

            <div className="card breakdown-card system-card">
              <h3 className="breakdown-title">Administrative Actions</h3>
              <div className="admin-actions-advice">
                <p>Ensure that all content respects general terms of services. As an admin, you can:</p>
                <ul>
                  <li>Promote standard users to admins.</li>
                  <li>Delete accounts and all related entries if flagged.</li>
                  <li>Directly moderate all posts & comments on individual post detail pages.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card admin-users-table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Email</th>
                  <th>Joined Date</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const joinedDate = new Date(u.createdAt).toLocaleDateString();

                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="table-user-cell">
                          {u.profilePicture ? (
                            <img src={u.profilePicture} alt={u.name} className="table-user-avatar" />
                          ) : (
                            <div className="table-avatar-placeholder">{u.name[0].toUpperCase()}</div>
                          )}
                          <span className="table-user-name">{u.name}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{joinedDate}</td>
                      <td>
                        <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                          {u.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRoleToggle(u._id, u.role)}
                            title={u.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                          >
                            <Shield size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u._id)}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
