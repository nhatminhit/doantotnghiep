const { Sequelize, DataTypes } = require('sequelize');
const db = require('./database');

const FavoriteProduct = db.define('Favorite', {
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    }
}, {
    tableName: 'favoriteProduct',
    timestamps: false
});

db.sync();

module.exports = FavoriteProduct;
