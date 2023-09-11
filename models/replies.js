const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const Replies = db.define('Replies', {
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
        allowNull: false
    },
    feedbackProduct_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    commentNews_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'Replies',
    timestamps: false
});

db.sync();

module.exports = Replies;
