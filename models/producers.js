const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const Producer = db.define('Producers', {
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
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'producers',
    timestamps: false
});

db.sync();

module.exports = Producer;
