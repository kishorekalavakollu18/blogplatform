const express = require('express');
const router = express.Router();
const {
  getCommentsByPost,
  createComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createComment);

router.route('/:id')
  .delete(protect, deleteComment);

router.route('/post/:postId')
  .get(getCommentsByPost);

module.exports = router;
