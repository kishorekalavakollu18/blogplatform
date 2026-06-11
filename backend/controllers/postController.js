const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { handleUpload } = require('../middleware/upload');

// @desc    Get all posts (with search, category, author filtering, and pagination)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;

    const query = {};

    // Search query
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { summary: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    // Author filter
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Tag filter
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    const total = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: posts.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalPosts: total,
      posts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email profilePicture');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, summary, category, tags } = req.body;

    if (!title || !content || !summary) {
      return res.status(400).json({ success: false, message: 'Title, content and summary are required' });
    }

    let coverImage = '';
    if (req.file) {
      coverImage = await handleUpload(req.file);
    }

    // Process tags if it's sent as string or array
    let tagsArray = [];
    if (tags) {
      tagsArray = Array.isArray(tags) 
        ? tags 
        : tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    const post = await Post.create({
      title,
      content,
      summary,
      coverImage,
      category: category || 'General',
      tags: tagsArray,
      author: req.user._id
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'name email profilePicture');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check user ownership or admin role
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }

    const { title, content, summary, category, tags } = req.body;

    post.title = title || post.title;
    post.content = content || post.content;
    post.summary = summary || post.summary;
    post.category = category || post.category;

    if (tags) {
      post.tags = Array.isArray(tags) 
        ? tags 
        : tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    if (req.file) {
      post.coverImage = await handleUpload(req.file);
    }

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id).populate('author', 'name email profilePicture');

    res.json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check user ownership or admin role
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    // Delete comments associated with this post
    await Comment.deleteMany({ postId: post._id });

    // Use deleteOne instead of remove
    await Post.deleteOne({ _id: post._id });

    res.json({ success: true, message: 'Post and comments removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like / Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if post already liked by this user
    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike (remove id)
      post.likes.splice(likeIndex, 1);
    } else {
      // Like (add id)
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({ success: true, likes: post.likes, liked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost
};
