// ==========================================================================
// AURA 3D — Main Web Application Controller & Interactive Logic
// ==========================================================================

const app = {
  products: [],
  categories: [],
  activeCategory: 'All',
  searchQuery: '',
  maxPrice: 1500,
  inStockOnly: false,
  sortOption: 'featured',
  currentView: 'grid',
  wishlist: [],
  lastOrderId: null,
  activeProductModal: null,

  async init() {
    try {
      const savedWishlist = localStorage.getItem('aura_wishlist');
      if (savedWishlist) {
        try { this.wishlist = JSON.parse(savedWishlist); } catch (e) { this.wishlist = []; }
      }
      this.updateWishlistCount();
    } catch (e) {
      console.warn('Wishlist init warning:', e);
    }

    try {
      if (window.ThreeEngine) {
        ThreeEngine.initHero();
      }
    } catch (e) {
      console.warn('3D Hero init warning:', e);
    }

    try {
      await auth.init();
    } catch (e) {
      console.warn('Auth init warning:', e);
    }

    try {
      cart.init();
    } catch (e) {
      console.warn('Cart init warning:', e);
    }

    try {
      await this.fetchCategories();
    } catch (e) {
      console.warn('Categories fetch warning:', e);
    }

    try {
      await this.fetchProducts();
    } catch (e) {
      console.warn('Products fetch warning:', e);
    }

    try {
      this.bindEvents();
      this.checkHealthStatus();
    } catch (e) {
      console.warn('Events bind warning:', e);
    }
  },

  async checkHealthStatus() {
    const res = await api.system.getHealth();
    const pill = document.getElementById('db-status-pill');
    if (pill && res.status === 'online') {
      const mode = res.database?.connected ? 'MongoDB Active' : 'Hybrid Cache Online';
      pill.innerHTML = `<span class="pulse-dot"></span> ${mode}`;
    }
  },

  async fetchCategories() {
    const res = await api.products.getCategories();
    if (res.success) {
      this.categories = res.categories;
      this.renderCategoryPills();
    }
  },

  renderCategoryPills() {
    const container = document.getElementById('category-pills-container');
    if (!container) return;

    container.innerHTML = this.categories.map(cat => `
      <button class="cat-pill ${cat.name === this.activeCategory ? 'active' : ''}" 
              onclick="app.setCategory('${cat.name}')">
        ${cat.name} <span class="badge">${cat.count}</span>
      </button>
    `).join('');
  },

  setCategory(category) {
    this.activeCategory = category;
    this.renderCategoryPills();
    this.fetchProducts();
  },

  async fetchProducts() {
    const grid = document.getElementById('products-grid-container');
    if (grid) {
      grid.innerHTML = `
        <div class="loading-spinner-wrap">
          <div class="cyber-spinner"></div>
          <p>Synthesizing cybernetic inventory...</p>
        </div>
      `;
    }

    const params = {};
    if (this.activeCategory !== 'All') params.category = this.activeCategory;
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.maxPrice < 1500) params.maxPrice = this.maxPrice;
    if (this.inStockOnly) params.inStock = 'true';
    if (this.sortOption !== 'featured') params.sort = this.sortOption;

    const res = await api.products.getAll(params);
    if (res.success) {
      this.products = res.products;
      this.renderProducts();
      
      const countEl = document.getElementById('results-count-text');
      if (countEl) countEl.textContent = `Showing ${res.products.length} artifact${res.products.length === 1 ? '' : 's'}`;
    }
  },

  renderProducts() {
    const container = document.getElementById('products-grid-container');
    if (!container) return;

    if (this.products.length === 0) {
      container.innerHTML = `
        <div class="loading-spinner-wrap">
          <i class="fa-solid fa-ghost" style="font-size: 40px; color: #64748b; margin-bottom: 12px;"></i>
          <h3>No matching gear found</h3>
          <p style="color: #94a3b8; margin-top: 6px;">Try adjusting your search criteria or price filters.</p>
          <button class="btn-primary-sm" style="margin-top: 16px;" onclick="app.resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    container.className = `products-grid ${this.currentView === 'list' ? 'list-view' : ''}`;

    container.innerHTML = this.products.map(prod => {
      const isWishlisted = this.wishlist.includes(prod.id);
      const stockPercent = Math.min(100, ((prod.stockCount || 10) / 40) * 100);

      return `
        <div class="product-card" data-tilt data-id="${prod.id}">
          <div class="card-media-wrap">
            ${prod.badge ? `<span class="card-badge">${prod.badge}</span>` : ''}
            <div class="card-quick-actions">
              <button class="quick-action-btn ${isWishlisted ? 'active' : ''}" onclick="app.toggleWishlist('${prod.id}', event)" title="Save to Wishlist">
                <i class="fa-solid fa-heart"></i>
              </button>
              <button class="quick-action-btn" onclick="app.openProductModal('${prod.id}')" title="3D Hologram Preview">
                <i class="fa-solid fa-cube"></i>
              </button>
            </div>
            <img src="${prod.image}" alt="${prod.name}" class="card-product-img" loading="lazy" onclick="app.openProductModal('${prod.id}')">
          </div>

          <div class="card-body">
            <span class="card-category">${prod.category}</span>
            <h3 class="card-title" onclick="app.openProductModal('${prod.id}')">${prod.name}</h3>

            <div class="card-rating-wrap">
              <div class="stars-row">
                ${this.renderStars(prod.rating)}
              </div>
              <span class="review-count-text">${prod.rating.toFixed(1)} (${prod.numReviews || 0})</span>
            </div>

            <div class="card-footer-flex">
              <div class="price-block">
                <span class="current-price">$${prod.price.toFixed(2)}</span>
                ${prod.originalPrice ? `<span class="original-price">$${prod.originalPrice.toFixed(2)}</span>` : ''}
              </div>
              <button class="btn-add-cart" onclick="cart.addItem(app.findProduct('${prod.id}'))" title="Add to Cart">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>

            <div class="stock-indicator-bar" title="${prod.stockCount || 0} units left in stock">
              <div class="stock-fill" style="width: ${stockPercent}%;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Initialize 3D Card Tilt Physics
    this.initCardTilt();
  },

  findProduct(id) {
    return this.products.find(p => p.id === id);
  },

  renderStars(rating) {
    let stars = '';
    const rounded = Math.round(rating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars += '<i class="fa-solid fa-star"></i> ';
      } else if (i - 0.5 === rounded) {
        stars += '<i class="fa-solid fa-star-half-stroke"></i> ';
      } else {
        stars += '<i class="fa-regular fa-star"></i> ';
      }
    }
    return stars;
  },

  // 3D Card Tilt on Mouse Movement
  initCardTilt() {
    const cards = document.querySelectorAll('.product-card[data-tilt]');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  },

  // ========================================================================
  // Product Details Modal & 3D Interactive Viewer
  // ========================================================================
  async openProductModal(productId) {
    const res = await api.products.getById(productId);
    if (!res.success) {
      this.showToast('Could not load product details', 'error');
      return;
    }

    const prod = res.product;
    const reviews = res.reviews || [];
    this.activeProductModal = prod;

    const modal = document.getElementById('product-details-modal');
    const content = document.getElementById('product-modal-content');
    if (!modal || !content) return;

    const colors = prod.colors || ['#6366f1', '#06b6d4', '#ec4899'];
    let specsRows = '';
    if (prod.specs) {
      const specsObj = prod.specs instanceof Map ? Object.fromEntries(prod.specs) : prod.specs;
      specsRows = Object.entries(specsObj).map(([k, v]) => `
        <tr>
          <td><strong>${k}</strong></td>
          <td>${v}</td>
        </tr>
      `).join('');
    }

    content.innerHTML = `
      <div class="product-modal-grid">
        <!-- Visualizer Area with 3D/Gallery Toggle -->
        <div>
          <div class="product-visual-stage">
            <div class="view-mode-toggle">
              <button class="view-mode-btn active" id="btn-mode-3d" onclick="app.switchProductView('3d')"><i class="fa-solid fa-cube"></i> 3D Mesh</button>
              <button class="view-mode-btn" id="btn-mode-photo" onclick="app.switchProductView('photo')"><i class="fa-regular fa-image"></i> Photo</button>
            </div>

            <!-- 3D Canvas -->
            <div id="product-canvas-3d" class="product-3d-canvas-wrap"></div>

            <!-- Photo Preview -->
            <img src="${prod.image}" id="product-modal-img" alt="${prod.name}" class="product-modal-img hide" style="width:100%;height:100%;object-fit:cover;">
          </div>

          <!-- Color Customizer Swatches -->
          <div class="color-swatches-row">
            <span style="font-size: 13px; color: #94a3b8;">Holo Finish:</span>
            ${colors.map((c, i) => `
              <div class="color-swatch ${i === 0 ? 'active' : ''}" 
                   style="background-color: ${c};" 
                   data-color="${c}"
                   onclick="app.selectProductColor('${c}', this)"></div>
            `).join('')}
          </div>
        </div>

        <!-- Details, Specs & Cart Form -->
        <div>
          <span class="card-category">${prod.category} • ${prod.brand || 'AURA'}</span>
          <h2 style="font-size: 26px; margin: 6px 0 12px;">${prod.name}</h2>
          
          <div class="card-rating-wrap">
            <div class="stars-row">${this.renderStars(prod.rating)}</div>
            <span class="review-count-text">${prod.rating.toFixed(1)} (${prod.numReviews || 0} customer reviews)</span>
          </div>

          <div class="price-block" style="margin-bottom: 18px;">
            <span class="current-price" style="font-size: 28px;">$${prod.price.toFixed(2)}</span>
            ${prod.originalPrice ? `<span class="original-price" style="font-size: 16px;">$${prod.originalPrice.toFixed(2)}</span>` : ''}
          </div>

          <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">${prod.description}</p>

          <!-- Specifications Table -->
          <table class="specs-table">
            <tbody>
              ${specsRows}
            </tbody>
          </table>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 14px; margin-top: 24px;">
            <button class="btn-cyber-primary" style="flex: 1;" onclick="cart.addItem(app.activeProductModal, 1, app.selectedModalColor)">
              <i class="fa-solid fa-cart-plus"></i> Add to Requisitions Tray
            </button>
            <button class="btn-cyber-outline" onclick="app.toggleWishlist('${prod.id}', event)">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Customer Reviews Section -->
      <div class="product-reviews-section">
        <h4 style="font-size: 18px; margin-bottom: 12px;"><i class="fa-solid fa-comments text-cyan"></i> Customer Reviews & Telemetry</h4>
        
        <div class="reviews-grid-scroll">
          ${reviews.length === 0 ? '<p style="color: #64748b; font-size: 13px;">No reviews yet. Be the first to leave one!</p>' : reviews.map(r => `
            <div class="review-bubble">
              <div class="review-header">
                <span class="review-author">${r.user}</span>
                <span class="stars-row">${app.renderStars(r.rating)}</span>
              </div>
              <p style="font-size: 13px; color: #cbd5e1;">${r.comment}</p>
            </div>
          `).join('')}
        </div>

        <!-- Add Review Form -->
        <form id="add-review-form" class="cyber-form" style="margin-top: 16px;" onsubmit="app.submitReview(event, '${prod.id}')">
          <div class="form-row">
            <div class="form-group">
              <label>Your Rating</label>
              <select id="rev-rating" class="custom-select">
                <option value="5">⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                <option value="4">⭐⭐⭐⭐ (4 - Great)</option>
                <option value="3">⭐⭐⭐ (3 - Average)</option>
                <option value="2">⭐⭐ (2 - Subpar)</option>
                <option value="1">⭐ (1 - Defective)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Your Feedback</label>
              <input type="text" id="rev-comment" required placeholder="Share your experience with this tech artifact...">
            </div>
          </div>
          <button type="submit" class="btn-primary-sm" style="width: max-content;"><i class="fa-solid fa-paper-plane"></i> Post Review</button>
        </form>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Initialize 3D Product Visualizer
    this.selectedModalColor = colors[0];
    setTimeout(() => {
      ThreeEngine.initProductViewer('product-canvas-3d', prod.modelType || 'torus', colors[0]);
    }, 100);
  },

  switchProductView(mode) {
    const canvas = document.getElementById('product-canvas-3d');
    const photo = document.getElementById('product-modal-img');
    const btn3d = document.getElementById('btn-mode-3d');
    const btnPhoto = document.getElementById('btn-mode-photo');

    if (mode === '3d') {
      canvas.classList.remove('hide');
      photo.classList.add('hide');
      btn3d.classList.add('active');
      btnPhoto.classList.remove('active');
    } else {
      canvas.classList.add('hide');
      photo.classList.remove('hide');
      btnPhoto.classList.add('active');
      btn3d.classList.remove('active');
    }
  },

  selectProductColor(hex, el) {
    this.selectedModalColor = hex;
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    if (el) el.classList.add('active');
    ThreeEngine.updateProductColor(hex);
  },

  closeProductModal() {
    const modal = document.getElementById('product-details-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  async submitReview(e, productId) {
    e.preventDefault();
    if (!auth.currentUser) {
      this.showToast('Please sign in to post a review', 'error');
      auth.openAuthModal();
      return;
    }

    const rating = document.getElementById('rev-rating').value;
    const comment = document.getElementById('rev-comment').value;

    const res = await api.products.addReview(productId, { rating, comment });
    if (res.success) {
      this.showToast('Review published!', 'success');
      this.openProductModal(productId);
      this.fetchProducts();
    } else {
      this.showToast(res.message || 'Failed to submit review', 'error');
    }
  },

  // ========================================================================
  // Wishlist Manager
  // ========================================================================
  toggleWishlist(productId, e) {
    if (e) e.stopPropagation();
    const idx = this.wishlist.indexOf(productId);
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
      this.showToast('Removed from wishlist', 'info');
    } else {
      this.wishlist.push(productId);
      this.showToast('Saved to wishlist!', 'success');
    }
    localStorage.setItem('aura_wishlist', JSON.stringify(this.wishlist));
    this.updateWishlistCount();
    this.renderProducts();
  },

  updateWishlistCount() {
    const badge = document.getElementById('wishlist-count-badge');
    if (badge) badge.textContent = this.wishlist.length;
  },

  // ========================================================================
  // Checkout & Interactive 3D Flippable Credit Card Flow
  // ========================================================================
  openCheckoutModal() {
    if (cart.items.length === 0) {
      this.showToast('Cart is empty', 'error');
      return;
    }

    // Prefill form if user is logged in
    if (auth.currentUser) {
      const nameInput = document.getElementById('ship-name');
      const emailInput = document.getElementById('ship-email');
      const streetInput = document.getElementById('ship-street');
      const cityInput = document.getElementById('ship-city');

      if (nameInput) nameInput.value = auth.currentUser.name || '';
      if (emailInput) emailInput.value = auth.currentUser.email || '';
      if (auth.currentUser.address) {
        if (streetInput) streetInput.value = auth.currentUser.address.street || '';
        if (cityInput) cityInput.value = auth.currentUser.address.city || '';
      }
    }

    this.goToCheckoutStep(1);
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  goToCheckoutStep(step) {
    for (let i = 1; i <= 3; i++) {
      const stepEl = document.getElementById(`checkout-step-${i}`);
      const nodeEl = document.getElementById(`step-node-${i}`);
      if (stepEl) {
        if (i === step) stepEl.classList.remove('hide');
        else stepEl.classList.add('hide');
      }
      if (nodeEl) {
        if (i <= step) nodeEl.classList.add('active');
        else nodeEl.classList.remove('active');
      }
    }
  },

  bindCheckoutCardSync() {
    const cardNumInput = document.getElementById('pay-card-num');
    const cardNameInput = document.getElementById('pay-card-name');
    const cardExpInput = document.getElementById('pay-card-exp');
    const cardCvvInput = document.getElementById('pay-card-cvv');
    const cardInner = document.getElementById('credit-card-inner');

    if (cardNumInput) {
      cardNumInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        val = val.match(/.{1,4}/g)?.join(' ') || val;
        e.target.value = val;
        const disp = document.getElementById('card-num-disp');
        if (disp) disp.textContent = val || '•••• •••• •••• ••••';
      });
    }

    if (cardNameInput) {
      cardNameInput.addEventListener('input', (e) => {
        const disp = document.getElementById('card-name-disp');
        if (disp) disp.textContent = (e.target.value || 'ALI').toUpperCase();
      });
    }

    if (cardExpInput) {
      cardExpInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
        e.target.value = val;
        const disp = document.getElementById('card-exp-disp');
        if (disp) disp.textContent = val || '12/28';
      });
    }

    if (cardCvvInput && cardInner) {
      cardCvvInput.addEventListener('focus', () => cardInner.classList.add('flipped'));
      cardCvvInput.addEventListener('blur', () => cardInner.classList.remove('flipped'));
      cardCvvInput.addEventListener('input', (e) => {
        const disp = document.getElementById('card-cvv-disp');
        if (disp) disp.textContent = e.target.value || '•••';
      });
    }

    // Shipping Form Submit
    const shipForm = document.getElementById('shipping-form');
    if (shipForm) {
      shipForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.goToCheckoutStep(2);
      });
    }

    // Payment Form Submit & Order Creation
    const payForm = document.getElementById('payment-form');
    if (payForm) {
      payForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.processOrder();
      });
    }
  },

  async processOrder() {
    const btnSubmit = document.getElementById('btn-submit-order');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authorizing Quantum Ledger...';
    }

    const shipAddress = {
      fullName: document.getElementById('ship-name').value,
      street: document.getElementById('ship-street').value,
      city: document.getElementById('ship-city').value,
      state: document.getElementById('ship-state').value,
      zip: document.getElementById('ship-zip').value,
      country: document.getElementById('ship-country').value
    };

    const cardVal = document.getElementById('pay-card-num').value.replace(/\s/g, '');
    const cardLast4 = cardVal.slice(-4) || '4242';

    const orderPayload = {
      items: cart.items,
      customerName: shipAddress.fullName,
      customerEmail: document.getElementById('ship-email').value,
      shippingAddress: shipAddress,
      pricing: {
        subtotal: cart.getSubtotal(),
        discount: cart.getDiscountAmount(),
        shipping: cart.getShipping(),
        tax: cart.getTax(),
        total: cart.getGrandTotal()
      },
      payment: {
        method: 'Credit Card',
        cardLast4: cardLast4,
        status: 'Paid'
      }
    };

    const res = await api.orders.create(orderPayload);

    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = 'Pay & Place Order <i class="fa-solid fa-shield-check"></i>';
    }

    if (res.success) {
      this.lastOrderId = res.order.id;
      this.renderOrderReceipt(res.order);
      this.goToCheckoutStep(3);
      cart.clear();

      // Fire Celebration Confetti
      if (window.confetti) {
        window.confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      this.showToast('Order confirmed and paid!', 'success');
    } else {
      this.showToast(res.message || 'Payment failed', 'error');
    }
  },

  renderOrderReceipt(order) {
    const container = document.getElementById('confirmed-receipt-details');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px; margin-bottom: 14px;">
        <div>
          <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Order Number</span>
          <h4 style="color: #38bdf8; font-size: 18px;">${order.id}</h4>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Tracking Number</span>
          <h4 style="color: #34d399; font-size: 16px;">${order.trackingNumber}</h4>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
        ${order.items.map(item => `
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span>${item.name} (x${item.quantity})</span>
            <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
          </div>
        `).join('')}
      </div>

      <div style="border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 12px; display: flex; justify-content: space-between; font-weight: 800; font-size: 16px;">
        <span>Total Paid</span>
        <span class="gradient-text">$${order.pricing.total.toFixed(2)}</span>
      </div>
    `;
  },

  // ========================================================================
  // Order Tracking Stepper Modal
  // ========================================================================
  async openTrackOrderModal(orderId = null) {
    const modal = document.getElementById('tracking-modal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (orderId) {
      document.getElementById('tracking-search-input').value = orderId;
      await this.loadTrackingData(orderId);
    }
  },

  closeTrackingModal() {
    const modal = document.getElementById('tracking-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  async searchTracking() {
    const query = document.getElementById('tracking-search-input').value.trim();
    if (!query) {
      this.showToast('Please enter an Order ID or Tracking Number', 'error');
      return;
    }
    await this.loadTrackingData(query);
  },

  async loadTrackingData(id) {
    const container = document.getElementById('tracking-content');
    if (!container) return;

    container.innerHTML = '<div class="cyber-spinner" style="width:30px;height:30px;margin:20px auto;"></div>';

    const res = await api.orders.getById(id);
    if (!res.success) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: #fb7185;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 28px; margin-bottom: 8px;"></i>
          <p>Order ID or Tracking code not found on the network.</p>
        </div>
      `;
      return;
    }

    const order = res.order;
    container.innerHTML = `
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="font-size: 16px;">${order.id}</h4>
            <span style="font-size: 12px; color: #94a3b8;">Status: <span class="status-tag status-${order.status}">${order.status}</span></span>
          </div>
          <span style="font-size: 12px; color: #38bdf8;">${order.trackingNumber}</span>
        </div>
      </div>

      <div class="timeline-stepper">
        ${order.timeline.map((step, idx) => `
          <div class="timeline-step-item ${step.done ? 'done' : ''}">
            <div class="timeline-dot">
              <i class="fa-solid ${step.done ? 'fa-check' : 'fa-circle-dot'}"></i>
            </div>
            <div>
              <div class="step-title-bold">${step.step}</div>
              <div class="step-time-str">${step.time}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ========================================================================
  // User Account & Orders History Modal
  // ========================================================================
  async openAccountModal() {
    if (!auth.currentUser) {
      auth.openAuthModal();
      return;
    }

    const nameEl = document.getElementById('account-user-name');
    const emailEl = document.getElementById('account-user-email');
    if (nameEl) nameEl.textContent = auth.currentUser.name;
    if (emailEl) emailEl.textContent = `${auth.currentUser.email} (${auth.currentUser.role.toUpperCase()})`;

    const ordersListEl = document.getElementById('account-orders-list');
    if (ordersListEl) {
      ordersListEl.innerHTML = '<div class="cyber-spinner" style="width:30px;height:30px;margin:20px auto;"></div>';
    }

    const modal = document.getElementById('account-modal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Fetch user orders
    const res = await api.orders.getMyOrders();
    if (res.success && ordersListEl) {
      if (res.orders.length === 0) {
        ordersListEl.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 30px;">No requisitions placed yet.</p>';
      } else {
        ordersListEl.innerHTML = `
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${res.orders.map(o => `
                <tr>
                  <td><strong>${o.id}</strong></td>
                  <td>${o.items.length} item(s)</td>
                  <td><span class="gradient-text">$${o.pricing.total.toFixed(2)}</span></td>
                  <td><span class="status-tag status-${o.status}">${o.status}</span></td>
                  <td>
                    <button class="btn-primary-sm" style="padding: 4px 10px; font-size: 11px;" onclick="app.closeAccountModal(); app.openTrackOrderModal('${o.id}')">
                      Track <i class="fa-solid fa-arrow-right"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }
  },

  closeAccountModal() {
    const modal = document.getElementById('account-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  // ========================================================================
  // Admin Inventory & Orders Console
  // ========================================================================
  async openAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    await this.loadAdminStats();
    await this.loadAdminOrders();
  },

  closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  async loadAdminStats() {
    const res = await api.system.getStats();
    const container = document.getElementById('admin-stats-container');
    const dbStatus = document.getElementById('admin-db-status');

    if (dbStatus && res.database) {
      dbStatus.innerHTML = `<span class="pulse-dot"></span> ${res.database.mode}`;
    }

    if (container && res.success) {
      container.innerHTML = `
        <div class="admin-stat-card">
          <div class="admin-stat-num">$${res.stats.totalSales.toFixed(2)}</div>
          <span style="font-size: 12px; color: #94a3b8;">Total Revenue</span>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-num">${res.stats.totalOrders}</div>
          <span style="font-size: 12px; color: #94a3b8;">Total Orders</span>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-num">${res.stats.totalProducts}</div>
          <span style="font-size: 12px; color: #94a3b8;">Active Catalog Items</span>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-num">${res.stats.totalUsers}</div>
          <span style="font-size: 12px; color: #94a3b8;">Registered Users</span>
        </div>
      `;
    }
  },

  async loadAdminOrders() {
    const res = await api.orders.getAllOrders();
    const container = document.getElementById('admin-orders-table');
    if (!container) return;

    if (res.success) {
      container.innerHTML = `
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            ${res.orders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.customerName}<br><small style="color: #64748b;">${o.customerEmail}</small></td>
                <td>$${o.pricing.total.toFixed(2)}</td>
                <td><span class="status-tag status-${o.status}">${o.status}</span></td>
                <td>
                  <select class="custom-select" style="padding: 4px 8px; font-size: 11px;" onchange="app.changeOrderStatus('${o.id}', this.value)">
                    <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  },

  async changeOrderStatus(orderId, newStatus) {
    const res = await api.orders.updateStatus(orderId, newStatus);
    if (res.success) {
      this.showToast(`Order ${orderId} updated to ${newStatus}`, 'success');
      this.loadAdminOrders();
      this.loadAdminStats();
    } else {
      this.showToast(res.message || 'Status update failed', 'error');
    }
  },

  // ========================================================================
  // Global Event Listeners & Utilities
  // ========================================================================
  bindEvents() {
    // Search Input
    const searchInput = document.getElementById('global-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        this.searchQuery = e.target.value.trim();
        if (clearBtn) {
          if (this.searchQuery) clearBtn.classList.remove('hide');
          else clearBtn.classList.add('hide');
        }
        timeout = setTimeout(() => this.fetchProducts(), 300);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        clearBtn.classList.add('hide');
        this.fetchProducts();
      });
    }

    // Price Range Slider
    const priceSlider = document.getElementById('price-range-slider');
    const priceLabel = document.getElementById('price-val-label');
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        this.maxPrice = Number(e.target.value);
        if (priceLabel) priceLabel.textContent = `$${this.maxPrice.toLocaleString()}`;
        this.fetchProducts();
      });
    }

    // In-Stock Toggle
    const stockToggle = document.getElementById('stock-filter-toggle');
    if (stockToggle) {
      stockToggle.addEventListener('change', (e) => {
        this.inStockOnly = e.target.checked;
        this.fetchProducts();
      });
    }

    // Sort Dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortOption = e.target.value;
        this.fetchProducts();
      });
    }

    // Reset Filters Button
    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetFilters());

    // Grid / List View Buttons
    const gridBtn = document.getElementById('view-grid-btn');
    const listBtn = document.getElementById('view-list-btn');
    if (gridBtn && listBtn) {
      gridBtn.addEventListener('click', () => {
        this.currentView = 'grid';
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
        this.renderProducts();
      });
      listBtn.addEventListener('click', () => {
        this.currentView = 'list';
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
        this.renderProducts();
      });
    }

    // Admin Panel Open Buttons
    const adminBtn = document.getElementById('btn-admin-panel');
    if (adminBtn) adminBtn.addEventListener('click', () => this.openAdminModal());

    // Admin Add Product Form
    const addProdForm = document.getElementById('admin-add-product-form');
    if (addProdForm) {
      addProdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newProductData = {
          name: document.getElementById('adm-pname').value,
          category: document.getElementById('adm-pcat').value,
          price: document.getElementById('adm-pprice').value,
          stockCount: document.getElementById('adm-pstock').value,
          modelType: document.getElementById('adm-pmodel').value,
          image: document.getElementById('adm-pimg').value,
          description: document.getElementById('adm-pdesc').value
        };

        const res = await api.products.addProduct(newProductData);
        if (res.success) {
          this.showToast('Product added to catalog!', 'success');
          addProdForm.reset();
          await this.fetchCategories();
          await this.fetchProducts();
          await this.loadAdminStats();
        } else {
          this.showToast(res.message || 'Failed to add product', 'error');
        }
      });
    }

    // Hero Quick 3D Button
    const heroQuick3DBtn = document.getElementById('btn-hero-quick-3d');
    if (heroQuick3DBtn) {
      heroQuick3DBtn.addEventListener('click', () => {
        if (this.products.length > 0) {
          this.openProductModal(this.products[0].id);
        }
      });
    }

    // Bind Checkout 3D Card events
    this.bindCheckoutCardSync();
  },

  resetFilters() {
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.maxPrice = 1500;
    this.inStockOnly = false;
    this.sortOption = 'featured';

    const searchInput = document.getElementById('global-search-input');
    const priceSlider = document.getElementById('price-range-slider');
    const priceLabel = document.getElementById('price-val-label');
    const stockToggle = document.getElementById('stock-filter-toggle');
    const sortSelect = document.getElementById('sort-select');

    if (searchInput) searchInput.value = '';
    if (priceSlider) priceSlider.value = 1500;
    if (priceLabel) priceLabel.textContent = '$1,500';
    if (stockToggle) stockToggle.checked = false;
    if (sortSelect) sortSelect.value = 'featured';

    this.renderCategoryPills();
    this.fetchProducts();
    this.showToast('Filters reset', 'info');
  },

  copyCoupon(code) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      this.showToast(`Copied code "${code}"!`, 'success');
    }
    const couponInput = document.getElementById('coupon-input');
    if (couponInput) couponInput.value = code;
  },

  subscribeNewsletter() {
    const input = document.getElementById('newsletter-input');
    if (input && input.value) {
      this.showToast('Subscribed to VIP Cyber Drops!', 'success');
      input.value = '';
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check text-emerald';
    else if (type === 'error') icon = 'fa-circle-exclamation text-rose';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

// Initialize App on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

window.app = app;
