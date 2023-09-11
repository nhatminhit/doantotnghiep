const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const Jobs = db.define('Jobs', {
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
    timeType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    experience: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deadline: {
        type: DataTypes.STRING,
        allowNull: false
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salary: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }, 
    requirements: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    benefits: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'jobs',
    timestamps: false
});

db.sync();

module.exports = Jobs;
