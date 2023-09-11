const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const ImageProduct = db.define('ImageProducts', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    product_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'imageProducts',
    timestamps: false
});

db.sync();

module.exports = ImageProduct;
