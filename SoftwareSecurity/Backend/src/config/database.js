const { Sequelize, DataTypes } = require('sequelize');

// Define sequelize instance with more configurable connection
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || "1234",  // Empty default password
  database: process.env.DB_NAME || 'bank',
  logging: false // Set to console.log to see SQL queries
});

// Define models
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  }
});

const Account = sequelize.define('Account', {
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
});

// Establish relationships
User.hasMany(Account);
Account.belongsTo(User);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
    
    // Sync models with database (create tables)
    await sequelize.sync();
    
    // Initialize database with default users if none exist
    const usersCount = await User.count();
    if (usersCount === 0) {
      await initializeDatabase();
    }
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
}

async function initializeDatabase() {
  console.log('Initializing database with default users and accounts...');
  
  // Create 4 users, each with 2 accounts
  const users = [
    {
      username: 'john_doe',
      password: 'password123', // Plaintext password (vulnerable)
      email: 'john@example.com',
      role: 'user'
    },
    {
      username: 'jane_smith',
      password: 'jane123', // Plaintext password (vulnerable)
      email: 'jane@example.com',
      role: 'user'
    },
    {
      username: 'alice_johnson',
      password: 'alice456', // Plaintext password (vulnerable)
      email: 'alice@example.com',
      role: 'user'
    },
    {
      username: 'admin',
      password: 'admin123', // Plaintext password (vulnerable)
      email: 'admin@bank.com',
      role: 'admin'
    }
  ];
  
  for (const userData of users) {
    // Create user
    const user = await User.create(userData);
    
    // Create two accounts for each user
    for (let i = 0; i < 2; i++) {
      await Account.create({
        accountNumber: Math.floor(Math.random() * 10000000000).toString(),
        balance: 10000 + Math.random() * 90000,
        UserId: user.id // Association automatically handled by Sequelize
      });
    }
  }
  
  console.log('Database initialized with default data');
}

module.exports = { 
  connectDB,
  sequelize,
  User,
  Account
};