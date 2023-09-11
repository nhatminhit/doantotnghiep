const { Sequelize, DataTypes } = require('sequelize');
const db = require('./database');

const OrderDetail = db.define('OrderDetail', {
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    tableName: 'orderDetail',
    timestamps: false
});

db.sync();

module.exports = OrderDetail;
