const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
