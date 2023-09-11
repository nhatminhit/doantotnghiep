const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const Support = db.define('Support', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createTime: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Support',
    timestamps: false
});

db.sync();

module.exports = Support;
