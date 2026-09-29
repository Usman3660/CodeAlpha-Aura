const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  brand: { type: String, default: 'AURA' },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  rating: { type: Number, default: 5.0 },
  numReviews: { type: Number, default: 0 },
  badge: { type: String },
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number, default: 10 },
  image: { type: String, required: true },
  gallery: [String],
  description: { type: String, required: true },
  specs: { type: Map, of: String },
  features: [String],
  colors: [String],
  modelType: { type: String, default: 'torus' }
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
