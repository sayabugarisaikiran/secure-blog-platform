// ============================================================
// Model Index — Associations & Exports
// ============================================================
// Sets up relationships between models:
//   User hasMany Posts (one author → many posts)
//   Post belongsTo User (each post → one author)
// ============================================================

const sequelize = require('../config/database');
const User = require('./User');
const Post = require('./Post');

// Define associations
User.hasMany(Post, {
    foreignKey: 'authorId',
    as: 'posts',
});

Post.belongsTo(User, {
    foreignKey: 'authorId',
    as: 'author',
});

module.exports = {
    sequelize,
    User,
    Post,
};
