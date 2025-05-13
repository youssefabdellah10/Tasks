// Database configuration
const {Sequelize} = require('sequelize');
require('dotenv').config();

// PostgreSQL connection string
const DB_URI = process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;

const dbConfig = new Sequelize(DB_URI, {
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 10,           
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// RabbitMQ configuration
const rabbitConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  exchange: 'food_delivery',
  queues: {
    dishOrder: 'dish.order.queue',
    stockUpdate: 'dish.stock.queue'
  }
};

// Server configuration
const serverConfig = {
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || 'development'
};

module.exports = {
  db: dbConfig,
  rabbit: rabbitConfig,
  server: serverConfig
};
