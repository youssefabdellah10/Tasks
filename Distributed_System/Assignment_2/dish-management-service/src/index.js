const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dishRoutes = require('./routes/dish.routes');
const { db: sequelizeInstance } = require('./config/config');
// Import models to ensure they're registered with Sequelize
const Dish = require('./models/dish.model');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/dishes', dishRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'dish-management-service' });
});


// Connect to PostgreSQL
// Test the connection and start server
sequelizeInstance
    .authenticate()
    .then(() => {
        console.log('Connected to PostgreSQL database');
        
        // Sync models with database
        return sequelizeInstance.sync();
    })
    .then(() => {
        console.log('Database models synchronized');
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`Dish Management Service running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

module.exports = app;
