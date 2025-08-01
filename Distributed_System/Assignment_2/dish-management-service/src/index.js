const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dishRoutes = require('./routes/dish.routes');
const { db: sequelizeInstance } = require('./config/config');
const Dish = require('./models/dish.model');
const { connectRabbitMQ } = require('./services/rabbitmq.service');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/dishes', dishRoutes);

sequelizeInstance
    .authenticate()
    .then(() => {
        console.log('Connected to PostgreSQL database');
        return sequelizeInstance.sync();
    })    .then(() => {
        console.log('Database models synchronized');
        
        // Initialize RabbitMQ connection
        connectRabbitMQ().then(() => {
            console.log('RabbitMQ initialized');
        }).catch(err => {
            console.error('RabbitMQ initialization error:', err);
        });
        
        app.listen(PORT, () => {
            console.log(`Dish Management Service running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

module.exports = app;
