const { initialProducts, initialCoupons } = require('../seed/seedData');
const bcrypt = require('bcryptjs');

// In-Memory Data Store (Used if Mongo is not running, or synchronized)
class DataStore {
  constructor() {
    this.products = [...initialProducts];
    this.coupons = [...initialCoupons];
    this.users = [];
    this.orders = [];
    this.reviews = {
      'prod-1': [
        { id: 'rev-1', user: 'Ali', rating: 5, comment: 'The 3D spatial audio staging is unbelievable. Pure perfection!', date: '2026-09-12' },
        { id: 'rev-2', user: 'Ayesha', rating: 5, comment: 'Battery lasts forever and the RGB ring sync is super sleek.', date: '2026-09-18' }
      ],
      'prod-2': [
        { id: 'rev-3', user: 'Ahmad', rating: 5, comment: 'The titanium build feels so premium. Holographic watchface is mind-blowing.', date: '2026-09-15' }
      ],
      'prod-3': [
        { id: 'rev-4', user: 'Omar', rating: 5, comment: 'Best AR visor on the market. Zero lag and unbelievable clarity.', date: '2026-09-20' }
      ]
    };
    
    // Seed default demo accounts
    this.initDefaultUsers();
  }

  async initDefaultUsers() {
    const passwordHash = await bcrypt.hash('password123', 10);
    this.users = [
      {
        id: 'usr-admin',
        name: 'Ahmad (Admin)',
        email: 'ahmad@aura.io',
        password: passwordHash,
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-demo',
        name: 'Ali',
        email: 'ali@aura.io',
        password: passwordHash,
        role: 'user',
        createdAt: new Date().toISOString(),
        address: {
          street: '742 Cyberpunk Blvd, Apt 4B',
          city: 'Neo Tokyo',
          state: 'NT',
          zip: '90210',
          country: 'United States'
        }
      },
      {
        id: 'usr-ayesha',
        name: 'Ayesha',
        email: 'ayesha@aura.io',
        password: passwordHash,
        role: 'user',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-omar',
        name: 'Omar',
        email: 'omar@aura.io',
        password: passwordHash,
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];

    // Seed a couple of demo orders for the demo user
    this.orders = [
      {
        id: 'ORD-98421',
        userId: 'usr-demo',
        customerName: 'Ali',
        customerEmail: 'ali@aura.io',
        items: [
          {
            id: 'prod-1',
            name: 'Aura Nexus Pro Cyber-Headset',
            price: 299.99,
            quantity: 1,
            color: '#6366f1',
            image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
          }
        ],
        shippingAddress: {
          fullName: 'Ali',
          street: '742 Cyberpunk Blvd, Apt 4B',
          city: 'Neo Tokyo',
          state: 'NT',
          zip: '90210',
          country: 'United States'
        },
        pricing: {
          subtotal: 299.99,
          discount: 0,
          shipping: 0,
          tax: 24.00,
          total: 323.99
        },
        payment: {
          method: 'Credit Card',
          cardLast4: '4242',
          status: 'Paid'
        },
        status: 'Delivered',
        trackingNumber: 'AURA-TRK-98421',
        timeline: [
          { step: 'Order Placed', time: '2026-09-10 14:22', done: true },
          { step: 'Payment Verified', time: '2026-09-10 14:23', done: true },
          { step: 'Shipped from Hub', time: '2026-09-11 09:15', done: true },
          { step: 'Delivered', time: '2026-09-13 11:40', done: true }
        ],
        createdAt: '2026-09-10T14:22:00.000Z'
      }
    ];
  }

  // Product Methods
  getProducts(query = {}) {
    let list = [...this.products];
    const { category, search, minPrice, maxPrice, sort, inStock } = query;

    if (category && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (minPrice) {
      list = list.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      list = list.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (inStock === 'true') {
      list = list.filter(p => p.inStock && p.stockCount > 0);
    }

    if (sort) {
      if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
      else if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
      else if (sort === 'reviews') list.sort((a, b) => b.numReviews - a.numReviews);
    }

    return list;
  }

  getProductById(id) {
    return this.products.find(p => p.id === id || p.slug === id);
  }

  addProduct(productData) {
    const id = `prod-${Date.now()}`;
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct = {
      id,
      slug,
      rating: 5.0,
      numReviews: 1,
      badge: 'NEW',
      inStock: true,
      stockCount: productData.stockCount || 10,
      gallery: [productData.image],
      colors: productData.colors || ['#6366f1', '#06b6d4'],
      modelType: productData.modelType || 'torus',
      specs: productData.specs || { 'Model': 'Latest Release', 'Warranty': '2 Years' },
      features: productData.features || ['Premium Aerospace Materials', 'Smart AI Core'],
      ...productData
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updates };
      return this.products[idx];
    }
    return null;
  }

  deleteProduct(id) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      return this.products.splice(idx, 1)[0];
    }
    return null;
  }

  // Reviews
  getReviews(productId) {
    return this.reviews[productId] || [];
  }

  addReview(productId, review) {
    if (!this.reviews[productId]) {
      this.reviews[productId] = [];
    }
    const newReview = {
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...review
    };
    this.reviews[productId].unshift(newReview);

    // Update product rating
    const prod = this.getProductById(productId);
    if (prod) {
      const allRevs = this.reviews[productId];
      const avg = allRevs.reduce((acc, r) => acc + Number(r.rating), 0) / allRevs.length;
      prod.rating = parseFloat(avg.toFixed(1));
      prod.numReviews = allRevs.length;
    }

    return newReview;
  }

  // User Methods
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  addUser(userData) {
    const user = {
      id: `usr-${Date.now()}`,
      role: 'user',
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.users.push(user);
    return user;
  }

  updateUser(id, updates) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      return this.users[idx];
    }
    return null;
  }

  // Order Methods
  createOrder(orderData) {
    const orderNumber = Math.floor(10000 + Math.random() * 90000);
    const id = `ORD-${orderNumber}`;
    const newOrder = {
      id,
      trackingNumber: `AURA-TRK-${orderNumber}`,
      status: 'Processing',
      createdAt: new Date().toISOString(),
      timeline: [
        { step: 'Order Placed', time: new Date().toLocaleString(), done: true },
        { step: 'Processing & Packaging', time: new Date().toLocaleString(), done: true },
        { step: 'Shipped to Dispatch Hub', time: 'Estimated 24-48 hrs', done: false },
        { step: 'Out for Delivery', time: 'Pending Delivery', done: false }
      ],
      ...orderData
    };
    this.orders.unshift(newOrder);

    // Deduct stock
    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items.forEach(item => {
        const prod = this.getProductById(item.id);
        if (prod) {
          prod.stockCount = Math.max(0, (prod.stockCount || 10) - (item.quantity || 1));
          if (prod.stockCount === 0) prod.inStock = false;
        }
      });
    }

    return newOrder;
  }

  getOrders(userId = null) {
    if (userId) {
      return this.orders.filter(o => o.userId === userId);
    }
    return this.orders;
  }

  getOrderById(id) {
    return this.orders.find(o => o.id === id || o.trackingNumber === id);
  }

  updateOrderStatus(id, status) {
    const order = this.getOrderById(id);
    if (!order) return null;
    order.status = status;

    // Update timeline steps based on status
    const nowStr = new Date().toLocaleString();
    if (status === 'Processing') {
      order.timeline[0].done = true;
      order.timeline[1].done = true;
    } else if (status === 'Shipped') {
      order.timeline[0].done = true;
      order.timeline[1].done = true;
      order.timeline[2].done = true;
      order.timeline[2].time = nowStr;
    } else if (status === 'Delivered') {
      order.timeline.forEach(t => t.done = true);
      order.timeline[3].time = nowStr;
    } else if (status === 'Cancelled') {
      order.timeline.push({ step: 'Order Cancelled', time: nowStr, done: true });
    }

    return order;
  }

  // Coupon Methods
  getCoupon(code) {
    if (!code) return null;
    return this.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  }

  // Stats for Admin
  getStats() {
    const totalSales = this.orders.reduce((acc, o) => acc + (o.pricing?.total || 0), 0);
    const totalOrders = this.orders.length;
    const totalUsers = this.users.length;
    const totalProducts = this.products.length;

    return {
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders: this.orders.slice(0, 5)
    };
  }
}

const store = new DataStore();
module.exports = store;
