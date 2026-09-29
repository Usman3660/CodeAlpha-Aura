const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node.js querySrv ECONNREFUSED on Windows with certain local DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

let isConnectedToMongo = false;

const seedMongoData = async () => {
  try {
    const Product = require('../models/Product');
    const User = require('../models/User');
    const { initialProducts } = require('../seed/seedData');
    const bcrypt = require('bcryptjs');

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Seeding initial products to MongoDB...');
      await Product.insertMany(initialProducts);
      console.log(`✅ Seeded ${initialProducts.length} products to MongoDB collection 'products'.`);
    }

    const passwordHash = await bcrypt.hash('password123', 10);
    const demoAccounts = [
      {
        name: 'Ahmad (Admin)',
        email: 'ahmad@aura.io',
        password: passwordHash,
        role: 'admin'
      },
      {
        name: 'Ali',
        email: 'ali@aura.io',
        password: passwordHash,
        role: 'user',
        address: {
          street: '742 Cyberpunk Blvd, Apt 4B',
          city: 'Neo Tokyo',
          state: 'NT',
          zip: '90210',
          country: 'United States'
        }
      },
      {
        name: 'Ayesha',
        email: 'ayesha@aura.io',
        password: passwordHash,
        role: 'user'
      },
      {
        name: 'Omar',
        email: 'omar@aura.io',
        password: passwordHash,
        role: 'user'
      }
    ];

    for (const acc of demoAccounts) {
      await User.findOneAndUpdate(
        { email: acc.email },
        acc,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Synced demo accounts (Ali, Ahmad, Ayesha, Omar) to MongoDB 'users'.`);
  } catch (err) {
    console.warn('⚠️ Seeding note:', err.message);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura_ecommerce_db';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnectedToMongo = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    
    // Seed initial data if empty
    await seedMongoData();
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    console.log('ℹ️ Running in memory-hybrid store mode. All CRUD, auth, and orders will function seamlessly!');
    isConnectedToMongo = false;
  }
};

const getStatus = () => ({
  connected: isConnectedToMongo,
  mode: isConnectedToMongo ? 'MongoDB Atlas' : 'In-Memory / Local Cache'
});

module.exports = { connectDB, getStatus, isConnected: () => isConnectedToMongo };

