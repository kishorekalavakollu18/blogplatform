const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add post content']
  },
  summary: {
    type: String,
    required: [true, 'Please add a post summary'],
    maxlength: [300, 'Summary cannot be more than 300 characters']
  },
  coverImage: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  category: {
    type: String,
    required: [true, 'Please add a category'],
    default: 'General'
  },
  tags: [
    {
      type: String,
      trim: true
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
