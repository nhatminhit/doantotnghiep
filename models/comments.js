const { Sequelize, DataTypes } = require('sequelize');
const db = require('./database');

const Comments = db.define('Comments', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    createTime: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reviews: {
        type: DataTypes.STRING,
        allowNull: false
    },
    news_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'comments',
    timestamps: false
});

db.sync();

module.exports = Comments;
