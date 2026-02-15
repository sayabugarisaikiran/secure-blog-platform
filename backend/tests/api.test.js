// ============================================================
// API Integration Tests
// ============================================================
// Tests the key flows: health, auth, and posts
// Run with: npm test
// ============================================================

const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Post } = require('../src/models');

// Test data
let adminToken;
let userToken;
let testPostId;

// Setup: Connect DB and create tables
beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key';
    await sequelize.sync({ force: true }); // Fresh tables for testing
});

// Cleanup: Close DB connection
afterAll(async () => {
    await sequelize.close();
});

// ============================================================
// Health Check Tests
// ============================================================
describe('GET /api/health', () => {
    it('should return healthy status', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.status).toBe('healthy');
        expect(res.body.database).toBe('connected');
    });
});

// ============================================================
// Auth Tests
// ============================================================
describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('should register an admin user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'admin',
                    email: 'admin@test.com',
                    password: 'password123',
                    role: 'admin',
                });
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            adminToken = res.body.data.token;
        });

        it('should register a regular user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'reader',
                    email: 'reader@test.com',
                    password: 'password123',
                });
            expect(res.statusCode).toBe(201);
            expect(res.body.data.user.role).toBe('user');
            userToken = res.body.data.token;
        });

        it('should reject duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'admin2',
                    email: 'admin@test.com',
                    password: 'password123',
                });
            expect(res.statusCode).toBe(409);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'password123',
                });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
        });

        it('should reject invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'wrongpassword',
                });
            expect(res.statusCode).toBe(401);
        });
    });
});

// ============================================================
// Post Tests
// ============================================================
describe('Post Endpoints', () => {
    describe('POST /api/posts (Admin)', () => {
        it('should create a draft post', async () => {
            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'My First Blog Post',
                    content: 'This is the content of my first blog post.',
                    status: 'draft',
                });
            expect(res.statusCode).toBe(201);
            expect(res.body.data.post.title).toBe('My First Blog Post');
            testPostId = res.body.data.post.id;
        });

        it('should create a published post', async () => {
            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Published Blog Post',
                    content: 'This post is published and visible to everyone.',
                    status: 'published',
                });
            expect(res.statusCode).toBe(201);
        });

        it('should reject post creation by regular user', async () => {
            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'Unauthorized Post',
                    content: 'This should fail.',
                });
            expect(res.statusCode).toBe(403);
        });

        it('should reject unauthenticated post creation', async () => {
            const res = await request(app)
                .post('/api/posts')
                .send({
                    title: 'No Token Post',
                    content: 'This should fail.',
                });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/posts (Public)', () => {
        it('should return only published posts', async () => {
            const res = await request(app).get('/api/posts');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.posts.length).toBe(1); // Only published
            expect(res.body.data.posts[0].title).toBe('Published Blog Post');
        });

        it('should include pagination', async () => {
            const res = await request(app).get('/api/posts');
            expect(res.body.data.pagination).toBeDefined();
            expect(res.body.data.pagination.total).toBe(1);
        });
    });

    describe('PUT /api/posts/:id (Admin)', () => {
        it('should update a post', async () => {
            const res = await request(app)
                .put(`/api/posts/${testPostId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Updated Blog Post',
                    status: 'published',
                });
            expect(res.statusCode).toBe(200);
            expect(res.body.data.post.title).toBe('Updated Blog Post');
        });
    });

    describe('DELETE /api/posts/:id (Admin)', () => {
        it('should delete a post', async () => {
            const res = await request(app)
                .delete(`/api/posts/${testPostId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Post deleted successfully');
        });
    });
});
