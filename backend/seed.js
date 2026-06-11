require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@blog.com',
    password: 'password123', // Will be hashed in pre-save hook
    role: 'admin',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Jane Smith',
    email: 'jane@blog.com',
    password: 'password123',
    role: 'user',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  }
];

const getSamplePosts = (adminId, janeId) => [
  {
    title: 'Getting Started with React and MERN Stack in 2026',
    summary: 'A comprehensive starter guide on constructing premium full-stack apps using MongoDB, Express, React, and Node.js.',
    content: `# The MERN Stack: A Modern Blueprint

The MERN stack (MongoDB, Express, React, Node.js) remains one of the most powerful and popular configurations for modern web application developers. In this walkthrough, we will examine the core architecture choices to launch scalable websites.

## 1. Why MongoDB is perfect for blogs
Relational databases require heavy migrations when changes occur. With MongoDB, schemas can easily expand. Adding likes, bookmarks or comments is as simple as adding fields to your JSON-like document model.

## 2. Setting up Express routing
Express is lightweight and fast. Here is a simple API structure:

\`\`\`javascript
const express = require('express');
const router = express.Router();

router.get('/posts', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});
\`\`\`

## 3. Best Practices in 2026
- Use HSL values in Vanilla CSS to implement clean theme transitions.
- Secure routes using JSON Web Tokens (JWT) inside auth headers.
- Build flexible local fallbacks for assets in case third party Cloudinary/AWS storage fails.
`,
    category: 'Technology',
    tags: ['react', 'mongodb', 'mern', 'nodejs'],
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    author: adminId,
    likes: [janeId]
  },
  {
    title: 'The Art of Minimalist Living: Tips for a Clutter-Free Life',
    summary: 'Discover how reducing physical and digital noise can lead to focus, productivity, and general peace of mind.',
    content: `# Finding Peace in Minimalism

Minimalism is not about throwing away everything you own; it is about finding focus. By clearing physical clutter, you make room for mental clarity and productivity.

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

### 1. Declutter your workspace
Keep only your computer, a notebook, and a single drink on your desk. Clean desks encourage deep work.

### 2. Digital minimalist steps
- Turn off notifications for all non-essential apps.
- Organize files weekly, removing duplicates.
- Keep your desktop background clean.

Try these simple adjustments and observe how your productivity shifts over the course of a single week!`,
    category: 'Lifestyle',
    tags: ['minimalism', 'productivity', 'lifestyle'],
    coverImage: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    author: janeId,
    likes: [adminId]
  },
  {
    title: 'Top 5 Coffee Brewing Methods for Coffee Aficionados',
    summary: 'From French Press to Chemex, we review the taste profiles, effort required, and tools for each brewing method.',
    content: `# Unleashing the Flavor: Brew Guides

Coffee is more than caffeine—it is a craft. Let us examine five distinct brewing techniques to elevate your morning routine.

### 1. Chemex (Pour Over)
- **Grind Size**: Medium-coarse
- **Profile**: Extremely clean, highlighting bright, fruity tasting notes.
- **Effort**: High. Requires slow circular pouring.

### 2. French Press
- **Grind Size**: Coarse
- **Profile**: Full-bodied, heavy, and robust.
- **Effort**: Low. Steeps for 4 minutes before pressing.

### 3. Aeropress
- **Grind Size**: Medium-fine
- **Profile**: Highly customizable. Can brew espresso-like concentrates or smooth light cups.
- **Effort**: Medium.

Experimenting with ratios and grind sizes is the secret to extracting the ultimate flavor profiles!`,
    category: 'Food',
    tags: ['coffee', 'brewing', 'foodie'],
    coverImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    author: janeId,
    likes: []
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogplatform');
    console.log('Connected to Database for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing collections.');

    // Seed Users
    const createdUsers = await User.create(sampleUsers);
    console.log(`Seeded ${createdUsers.length} users successfully.`);

    const adminUser = createdUsers.find(u => u.role === 'admin');
    const normalUser = createdUsers.find(u => u.role === 'user');

    // Seed Posts
    const postsData = getSamplePosts(adminUser._id, normalUser._id);
    const createdPosts = await Post.create(postsData);
    console.log(`Seeded ${createdPosts.length} posts successfully.`);

    // Seed Comments
    const commentSample = [
      {
        text: 'This guide was extremely useful! The CSS styling notes on custom scrollbars were exactly what I needed.',
        author: normalUser._id,
        postId: createdPosts[0]._id
      },
      {
        text: 'Totally agree. The MERN stack is still my go-to choice for rapid prototyping.',
        author: adminUser._id,
        postId: createdPosts[0]._id
      },
      {
        text: 'Minimalism has saved my remote working routine. Highly recommend separating workspace from leisure areas.',
        author: adminUser._id,
        postId: createdPosts[1]._id
      }
    ];

    const createdComments = await Comment.create(commentSample);
    console.log(`Seeded ${createdComments.length} comments successfully.`);

    console.log('Database seeding complete! Run npm start/dev to start.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
