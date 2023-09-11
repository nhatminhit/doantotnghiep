const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const Category = db.define('Categories', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }, 
    image: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'categories',
    timestamps: false
});


db.sync();

module.exports = Category;
