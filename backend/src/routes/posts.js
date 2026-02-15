// ============================================================
// Post Routes
// ============================================================
// Public routes (no auth needed):
//   GET /api/posts       — List published posts
//   GET /api/posts/:id   — Get single published post
//
// Admin routes (auth + admin role needed):
//   GET    /api/posts/admin/all — List ALL posts (incl. drafts)
//   POST   /api/posts           — Create new post
//   PUT    /api/posts/:id       — Update post
//   DELETE /api/posts/:id       — Delete post
// ============================================================

const express = require('express');
const router = express.Router();
const {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getAllPostsAdmin,
} = require('../controllers/postController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllPosts);
router.get('/admin/all', authenticate, authorizeAdmin, getAllPostsAdmin);
router.get('/:id', getPostById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, createPost);
router.put('/:id', authenticate, authorizeAdmin, updatePost);
router.delete('/:id', authenticate, authorizeAdmin, deletePost);

module.exports = router;
