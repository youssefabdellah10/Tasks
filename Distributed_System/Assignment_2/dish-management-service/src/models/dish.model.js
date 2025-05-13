const dbConfig = require('../config/config');
const { DataTypes } = require('sequelize');
const sequelize = dbConfig.db;
const Dish = sequelize.define('Dish', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
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
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  timestamps: true, // Enable createdAt and updatedAt fields
});




module.exports = Dish;
