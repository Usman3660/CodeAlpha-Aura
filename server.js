const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { connectDB, getStatus } = require('./config/db');
const { apiLimiter, authLimiter } = require('./config/security');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// 1. Security Headers with Helmet (protects against clickjacking, sniff attacks, headers)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// 2. CORS configuration
app.use(cors());

// 3. Request body parsing
app.use(express.json({ limit: '10kb' })); // Max payload 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 5. Global API Rate Limiting
app.use('/api', apiLimiter);

// 6. Strict Rate Limiting on Authentication routes
app.use('/api/auth', authLimiter);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
const { router: authRoutes } = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/stats', statsRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: getStatus(),
    version: '1.0.0'
  });
});

// Fallback to index.html for SPA frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`
🚀 ====================================================
✨ AURA 3D E-Commerce Server is running on port ${PORT}
🌐 Open in browser: http://localhost:${PORT}
💾 Mode: ${getStatus().mode}
🚀 ====================================================
  `);
});
