const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const store = require('../models/dataStore');
const Order = require('../models/Order');
const { isConnected } = require('../config/db');
const { protect, adminOnly } = require('./authRoutes');
const { sanitizeText } = require('../config/security');

const JWT_SECRET = process.env.JWT_SECRET || 'aura_super_secret_jwt_key_2026_999';

// Create new order
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, pricing, payment, customerName, customerEmail } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid cart items are required' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Valid shipping address is required' });
    }

    // Determine user ID if logged in (via header token if available)
    let userId = 'guest';
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // guest order
      }
    }

    const cleanShipping = {
      fullName: sanitizeText(shippingAddress.fullName || customerName || 'Guest Customer'),
      street: sanitizeText(shippingAddress.street),
      city: sanitizeText(shippingAddress.city),
      state: sanitizeText(shippingAddress.state || ''),
      zip: sanitizeText(shippingAddress.zip || ''),
      country: sanitizeText(shippingAddress.country || 'United States')
    };

    const cleanItems = items.map(it => ({
      id: String(it.id),
      name: sanitizeText(it.name),
      price: Math.max(0, Number(it.price) || 0),
      quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
      color: sanitizeText(it.color || '#6366f1'),
      image: String(it.image || '')
    }));

    const orderPayload = {
      userId,
      customerName: cleanShipping.fullName,
      customerEmail: sanitizeText(customerEmail || 'guest@aura.io'),
      items: cleanItems,
      shippingAddress: cleanShipping,
      pricing: {
        subtotal: Math.max(0, Number(pricing?.subtotal) || 0),
        discount: Math.max(0, Number(pricing?.discount) || 0),
        shipping: Math.max(0, Number(pricing?.shipping) || 0),
        tax: Math.max(0, Number(pricing?.tax) || 0),
        total: Math.max(0, Number(pricing?.total) || 0)
      },
      payment: {
        method: sanitizeText(payment?.method || 'Credit Card'),
        cardLast4: sanitizeText(payment?.cardLast4 || '4242').slice(-4),
        status: 'Paid'
      }
    };

    const newOrder = store.createOrder(orderPayload);

    if (isConnected()) {
      try {
        await Order.create(newOrder);
      } catch (err) {
        console.warn('MongoDB order insert warning:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user orders (Protected)
router.get('/my-orders', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let orders = [];

    if (isConnected()) {
      orders = await Order.find({ userId }).sort({ createdAt: -1 });
    }
    if (!orders || orders.length === 0) {
      orders = store.getOrders(userId);
    }

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all orders (Strictly Admin only)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    let orders = [];
    if (isConnected()) {
      orders = await Order.find({}).sort({ createdAt: -1 });
    }
    if (!orders || orders.length === 0) {
      orders = store.getOrders();
    }
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order by ID or tracking number
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (isConnected()) {
      order = await Order.findOne({ $or: [{ id }, { trackingNumber: id }] });
    }
    if (!order) {
      order = store.getOrderById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status (Strictly Admin only)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = store.updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (isConnected()) {
      await Order.findOneAndUpdate({ $or: [{ id }, { trackingNumber: id }] }, { status, timeline: updated.timeline });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

