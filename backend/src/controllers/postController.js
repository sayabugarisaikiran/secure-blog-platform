// ============================================================
// Post Controller — CRUD Operations
// ============================================================
// Public: list & read published posts
// Admin: create, update, delete posts
// ============================================================

const { Post, User } = require('../models');

// GET /api/posts — List all published posts (public)
const getAllPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: posts } = await Post.findAndCountAll({
            where: { status: 'published' },
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username'],
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/posts/:id — Get single post (public)
const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: { id: req.params.id, status: 'published' },
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username'],
            }],
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        res.json({
            success: true,
            data: { post },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/posts — Create post (admin only)
const createPost = async (req, res, next) => {
    try {
        const { title, content, status } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required',
            });
        }

        const post = await Post.create({
            title,
            content,
            status: status || 'draft',
            authorId: req.user.id,
        });

        // Fetch with author info
        const fullPost = await Post.findByPk(post.id, {
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username'],
            }],
        });

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: { post: fullPost },
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/posts/:id — Update post (admin only)
const updatePost = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        const { title, content, status } = req.body;
        await post.update({
            title: title || post.title,
            content: content || post.content,
            status: status || post.status,
        });

        const updatedPost = await Post.findByPk(post.id, {
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username'],
            }],
        });

        res.json({
            success: true,
            message: 'Post updated successfully',
            data: { post: updatedPost },
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/posts/:id — Delete post (admin only)
const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        await post.destroy();

        res.json({
            success: true,
            message: 'Post deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/posts/admin/all — List ALL posts including drafts (admin only)
const getAllPostsAdmin = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: posts } = await Post.findAndCountAll({
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username'],
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getAllPostsAdmin,
};
