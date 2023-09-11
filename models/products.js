const { Sequelize, DataTypes } = require('sequelize');
const db = require('./database');

const Product = db.define('Products', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    dateCreated: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    oldPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    uses: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expiry: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dosageForms: {
        type: DataTypes.STRING,
        allowNull: true
    },
    specification: {
        type: DataTypes.STRING,
        allowNull: true
    },
    trademark: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    support: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ingredient: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dosage: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sideEffects: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    preserve: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    object: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    view: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    producer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
    // ProducerId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true
    // }
}, {
    tableName: 'products',
    timestamps: false
});

db.sync();

module.exports = Product;
