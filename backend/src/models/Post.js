// ============================================================
// Post Model
// ============================================================
// Fields: id, title, content, status, author_id (FK → User)
// Status: 'draft' = only admin can see
//         'published' = everyone can see
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            len: [3, 200],
        },
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'draft',
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'author_id',
        references: {
            model: 'users',
            key: 'id',
        },
    },
}, {
    tableName: 'posts',
    timestamps: true,
});

module.exports = Post;
