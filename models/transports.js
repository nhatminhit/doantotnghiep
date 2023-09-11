const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const Transport = db.define('Transports', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'transports',
    timestamps: false
});

db.sync();

module.exports = Transport;
