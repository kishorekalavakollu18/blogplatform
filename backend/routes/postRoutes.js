const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.route('/')
  .get(getPosts)
  .post(protect, upload.single('coverImage'), createPost);

router.route('/:id')
  .get(getPostById)
  .put(protect, upload.single('coverImage'), updatePost)
  .delete(protect, deletePost);

router.route('/:id/like')
  .put(protect, toggleLikePost);

module.exports = router;
