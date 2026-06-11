// API Client for Blog Platform

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Posts
  async getPosts({ page = 1, limit = 6, search = '', category = 'All', author = '' } = {}) {
    let url = `/api/posts?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (author) url += `&author=${encodeURIComponent(author)}`;
    
    const res = await fetch(url);
    return res.json();
  },

  async getPost(id) {
    const res = await fetch(`/api/posts/${id}`);
    return res.json();
  },

  async createPost(formData) {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    });
    return res.json();
  },

  async updatePost(id, formData) {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: formData
    });
    return res.json();
  },

  async deletePost(id) {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  async toggleLike(id) {
    const res = await fetch(`/api/posts/${id}/like`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },

  // Comments
  async getComments(postId) {
    const res = await fetch(`/api/comments/post/${postId}`);
    return res.json();
  },

  async addComment(postId, text) {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getHeaders()
      },
      body: JSON.stringify({ postId, text })
    });
    return res.json();
  },

  async deleteComment(id) {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Admin
  async getStats() {
    const res = await fetch('/api/admin/stats', {
      headers: getHeaders()
    });
    return res.json();
  },

  async getUsers() {
    const res = await fetch('/api/admin/users', {
      headers: getHeaders()
    });
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  async updateUserRole(id, role) {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getHeaders()
      },
      body: JSON.stringify({ role })
    });
    return res.json();
  }
};
