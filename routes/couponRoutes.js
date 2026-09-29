const express = require('express');
const router = express.Router();
const store = require('../models/dataStore');

// Validate & apply coupon
router.post('/apply', (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
  }

  const coupon = store.getCoupon(code);
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
  }

  const subtotal = Number(cartTotal) || 0;
  let discountAmount = 0;
  let freeShipping = false;

  if (coupon.discountPercent) {
    discountAmount = parseFloat(((subtotal * coupon.discountPercent) / 100).toFixed(2));
  }
  if (coupon.freeShipping) {
    freeShipping = true;
  }

  res.json({
    success: true,
    message: `Coupon "${coupon.code}" applied: ${coupon.description}`,
    coupon: {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
      freeShipping,
      description: coupon.description
    }
  });
});

// List available coupons for user convenience
router.get('/', (req, res) => {
  res.json({
    success: true,
    coupons: store.coupons
  });
});

module.exports = router;
