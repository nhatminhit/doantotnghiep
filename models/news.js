const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const News = db.define('News', {
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
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    creator: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    type: {
       type: DataTypes.STRING,
       allowNull: true
    }, 
    view: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'news',
    timestamps: false
});

db.sync();

module.exports = News;
