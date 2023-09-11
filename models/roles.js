const {Sequelize, DataTypes} = require('sequelize');
const db = require('./database');

const Role = db.define('roles', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'roles',
    timestamps: false
});

db.sync();

module.exports = Role;
