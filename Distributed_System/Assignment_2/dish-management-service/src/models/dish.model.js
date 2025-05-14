const dbConfig = require('../config/config');
const { DataTypes } = require('sequelize');
const sequelize = dbConfig.db;
const Dish = sequelize.define('Dish', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  companyUsername: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sellerusername: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
});




module.exports = Dish;
