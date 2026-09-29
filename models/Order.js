const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
  color: String,
  image: String
});

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  userId: String,
  customerName: String,
  customerEmail: String,
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  pricing: {
    subtotal: Number,
    discount: Number,
    shipping: Number,
    tax: Number,
    total: Number
  },
  payment: {
    method: String,
    cardLast4: String,
    status: { type: String, default: 'Paid' }
  },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  trackingNumber: String,
  timeline: [
    {
      step: String,
      time: String,
      done: Boolean
    }
  ]
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
