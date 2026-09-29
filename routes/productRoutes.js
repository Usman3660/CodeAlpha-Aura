const express = require('express');
const router = express.Router();
const store = require('../models/dataStore');
const Product = require('../models/Product');
const { isConnected } = require('../config/db');
const { protect, adminOnly } = require('./authRoutes');
const { escapeRegex, sanitizeText } = require('../config/security');

// Get all products with filters, search, and sorting
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, inStock } = req.query;

    let products = [];
    if (isConnected()) {
      let filter = {};
      if (category && category !== 'All' && typeof category === 'string') {
        const safeCategory = escapeRegex(category);
        filter.category = new RegExp(`^${safeCategory}$`, 'i');
      }
      if (search && typeof search === 'string') {
        const safeSearch = escapeRegex(search.trim());
        filter.$or = [
          { name: { $regex: safeSearch, $options: 'i' } },
          { description: { $regex: safeSearch, $options: 'i' } },
          { brand: { $regex: safeSearch, $options: 'i' } },
          { category: { $regex: safeSearch, $options: 'i' } }
        ];
      }
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
        if (maxPrice && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
      }
      if (inStock === 'true') {
        filter.inStock = true;
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'price-low') sortOption = { price: 1 };
      else if (sort === 'price-high') sortOption = { price: -1 };
      else if (sort === 'rating') sortOption = { rating: -1 };
      else if (sort === 'reviews') sortOption = { numReviews: -1 };

      const rawProducts = await Product.find(filter).sort(sortOption).lean();
      products = rawProducts.map(p => ({
        ...p,
        id: p.id || p._id.toString()
      }));
    }
    
    // If not connected or no products found in mongo yet, use dataStore
    if (!products || products.length === 0) {
      products = store.getProducts(req.query);
    }

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Categories list with product counts
router.get('/categories', async (req, res) => {
  try {
    const products = store.getProducts();
    const categoriesMap = { 'All': products.length };
    
    products.forEach(p => {
      categoriesMap[p.category] = (categoriesMap[p.category] || 0) + 1;
    });

    const categories = Object.keys(categoriesMap).map(name => ({
      name,
      count: categoriesMap[name]
    }));

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product details + reviews
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    if (isConnected()) {
      const mongoose = require('mongoose');
      let query = [{ id: id }, { slug: id }];
      if (mongoose.Types.ObjectId.isValid(id)) {
        query.push({ _id: id });
      }
      const rawProd = await Product.findOne({ $or: query }).lean();
      if (rawProd) {
        product = { ...rawProd, id: rawProd.id || rawProd._id.toString() };
      }
    }
    if (!product) {
      product = store.getProductById(id);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = store.getReviews(product.id || id);

    res.json({
      success: true,
      product,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a review to a product (Authenticated user, sanitized comment)
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating and comment' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    // Sanitize comment to prevent stored XSS
    const cleanComment = sanitizeText(comment).substring(0, 500);

    const review = store.addReview(id, {
      user: req.user.name || 'Verified User',
      rating: numRating,
      comment: cleanComment
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new product (Strictly Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, category, price, description, image, brand, stockCount, originalPrice, modelType } = req.body;

    if (!name || !category || !price || !description) {
      return res.status(400).json({ success: false, message: 'Missing required product fields' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    const newProduct = store.addProduct({
      name: sanitizeText(name),
      category: sanitizeText(category),
      brand: brand ? sanitizeText(brand) : 'AURA Tech',
      price: numPrice,
      originalPrice: originalPrice ? Number(originalPrice) : numPrice * 1.25,
      description: sanitizeText(description),
      image: image || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      stockCount: Number(stockCount) || 20,
      modelType: modelType || 'torus'
    });

    if (isConnected()) {
      await Product.create(newProduct);
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
