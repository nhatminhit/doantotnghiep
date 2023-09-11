const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const Cart = db.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: {
        type: DataTypes.STRING,
        allowNull: false
    },
    product_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'cart',
    timestamps: false
});

db.sync();

module.exports = Cart;
