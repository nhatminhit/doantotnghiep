const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const Order = db.define('Orders', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    payments: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statusPayment: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalMoney: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ship: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shipCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shipFee: {
        type: DataTypes.FLOAT,
        allowNull: false   
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'orders',
    timestamps: false
});

db.sync();

module.exports = Order;
