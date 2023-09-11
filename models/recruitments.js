const { Sequelize, DataTypes } = require('sequelize');
const db = require('./database');

const Recruitment = db.define('Recruitments', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file: {
        type: DataTypes.STRING,
        allowNull: false
    },
    introduce: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'recruitments',
    timestamps: false
});

db.sync();

module.exports = Recruitment;
