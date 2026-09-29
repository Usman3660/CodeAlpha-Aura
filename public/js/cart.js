// ==========================================================================
// AURA 3D — Shopping Cart State & Promo Engine
// ==========================================================================

const cart = {
  items: [],
  appliedCoupon: null,
  FREE_SHIPPING_THRESHOLD: 150.00,
  SHIPPING_FEE: 15.00,
  TAX_RATE: 0.08,

  init() {
    const saved = localStorage.getItem('aura_cart');
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch (e) {
        this.items = [];
      }
    }
    const savedCoupon = localStorage.getItem('aura_coupon');
    if (savedCoupon) {
      try {
        this.appliedCoupon = JSON.parse(savedCoupon);
      } catch (e) {
        this.appliedCoupon = null;
      }
    }

    this.render();
    this.bindEvents();
  },

  save() {
    localStorage.setItem('aura_cart', JSON.stringify(this.items));
    if (this.appliedCoupon) {
      localStorage.setItem('aura_coupon', JSON.stringify(this.appliedCoupon));
    } else {
      localStorage.removeItem('aura_coupon');
    }
  },

  addItem(product, quantity = 1, selectedColor = null) {
    const color = selectedColor || (product.colors && product.colors[0]) || '#6366f1';
    const existingIndex = this.items.findIndex(item => item.id === product.id && item.color === color);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: color,
        quantity: quantity
      });
    }

    this.save();
    this.render();
    app.showToast(`Added "${product.name}" to cart!`, 'success');

    // Trigger badge pulse
    const badge = document.getElementById('cart-count-badge');
    if (badge) {
      badge.classList.remove('pulse');
      void badge.offsetWidth;
      badge.classList.add('pulse');
    }
  },

  updateQuantity(id, color, delta) {
    const item = this.items.find(i => i.id === id && i.color === color);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(id, color);
      return;
    }

    this.save();
    this.render();
  },

  removeItem(id, color) {
    this.items = this.items.filter(i => !(i.id === id && i.color === color));
    this.save();
    this.render();
    app.showToast('Item removed from cart', 'info');
  },

  clear() {
    this.items = [];
    this.appliedCoupon = null;
    this.save();
    this.render();
  },

  async applyCoupon(code) {
    if (!code || !code.trim()) {
      app.showToast('Please enter a voucher code', 'error');
      return;
    }

    const subtotal = this.getSubtotal();
    const res = await api.coupons.apply(code.trim(), subtotal);

    if (res.success) {
      this.appliedCoupon = res.coupon;
      this.save();
      this.render();
      app.showToast(res.message, 'success');
    } else {
      app.showToast(res.message || 'Invalid coupon code', 'error');
    }
  },

  removeCoupon() {
    this.appliedCoupon = null;
    this.save();
    this.render();
    app.showToast('Coupon removed', 'info');
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getDiscountAmount() {
    if (!this.appliedCoupon) return 0;
    const subtotal = this.getSubtotal();
    if (this.appliedCoupon.discountPercent) {
      return (subtotal * this.appliedCoupon.discountPercent) / 100;
    }
    return this.appliedCoupon.discountAmount || 0;
  },

  getShipping() {
    if (this.items.length === 0) return 0;
    if (this.appliedCoupon && this.appliedCoupon.freeShipping) return 0;
    const subtotal = this.getSubtotal();
    return subtotal >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_FEE;
  },

  getTax() {
    const discountedSubtotal = Math.max(0, this.getSubtotal() - this.getDiscountAmount());
    return discountedSubtotal * this.TAX_RATE;
  },

  getGrandTotal() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const shipping = this.getShipping();
    const tax = this.getTax();
    return Math.max(0, subtotal - discount + shipping + tax);
  },

  getTotalItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  },

  render() {
    const totalCount = this.getTotalItemCount();
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const shipping = this.getShipping();
    const tax = this.getTax();
    const grandTotal = this.getGrandTotal();

    // Update Header Badge
    const headerBadge = document.getElementById('cart-count-badge');
    if (headerBadge) headerBadge.textContent = totalCount;

    // Update Drawer Item Count
    const drawerItemCount = document.getElementById('drawer-item-count');
    if (drawerItemCount) drawerItemCount.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;

    // Free Shipping Progress
    const shippingProgressText = document.getElementById('shipping-progress-text');
    const shippingProgressBar = document.getElementById('shipping-progress-bar');
    if (shippingProgressText && shippingProgressBar) {
      if (subtotal >= this.FREE_SHIPPING_THRESHOLD || (this.appliedCoupon && this.appliedCoupon.freeShipping)) {
        shippingProgressText.innerHTML = '<span class="text-emerald"><i class="fa-solid fa-circle-check"></i> <strong>Free Express Shipping unlocked!</strong></span>';
        shippingProgressBar.style.width = '100%';
      } else {
        const remaining = (this.FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);
        const percent = Math.min(100, (subtotal / this.FREE_SHIPPING_THRESHOLD) * 100);
        shippingProgressText.innerHTML = `Add <strong>$${remaining}</strong> more for <strong>Free Express Shipping!</strong>`;
        shippingProgressBar.style.width = `${percent}%`;
      }
    }

    // Render Items List
    const listContainer = document.getElementById('cart-items-list');
    if (listContainer) {
      if (this.items.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-cart-state">
            <i class="fa-solid fa-cart-arrow-down"></i>
            <h4>Your Requisitions Tray is Empty</h4>
            <p>Explore high-tech artifacts and add them to your collection.</p>
          </div>
        `;
      } else {
        listContainer.innerHTML = this.items.map(item => `
          <div class="cart-item-card">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div>
              <h5 class="cart-item-title">${item.name}</h5>
              <div class="cart-item-price">
                $${item.price.toFixed(2)}
                <span class="cart-item-color-dot" style="background-color: ${item.color};" title="Color"></span>
              </div>
              <div class="qty-stepper">
                <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', '${item.color}', -1)">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', '${item.color}', 1)">+</button>
              </div>
            </div>
            <button class="remove-item-btn" onclick="cart.removeItem('${item.id}', '${item.color}')" title="Remove">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `).join('');
      }
    }

    // Render Coupon Pill
    const couponPill = document.getElementById('applied-coupon-pill');
    const couponName = document.getElementById('applied-coupon-name');
    if (couponPill && couponName) {
      if (this.appliedCoupon) {
        couponName.textContent = `${this.appliedCoupon.code} (${this.appliedCoupon.description})`;
        couponPill.classList.remove('hide');
      } else {
        couponPill.classList.add('hide');
      }
    }

    // Render Totals
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const discountRow = document.getElementById('cart-discount-row');
    const discountEl = document.getElementById('cart-discount-val');
    const shippingEl = document.getElementById('cart-shipping-val');
    const taxEl = document.getElementById('cart-tax-val');
    const grandTotalEl = document.getElementById('cart-grand-total-val');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (discountRow && discountEl) {
      if (discount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-$${discount.toFixed(2)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (grandTotalEl) grandTotalEl.textContent = `$${grandTotal.toFixed(2)}`;
  },

  bindEvents() {
    const applyBtn = document.getElementById('btn-apply-coupon');
    const couponInput = document.getElementById('coupon-input');
    if (applyBtn && couponInput) {
      applyBtn.addEventListener('click', () => {
        this.applyCoupon(couponInput.value);
        couponInput.value = '';
      });
      couponInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.applyCoupon(couponInput.value);
          couponInput.value = '';
        }
      });
    }

    // Open/Close Cart Drawer
    const openBtn = document.getElementById('btn-cart-open');
    const closeBtn = document.getElementById('btn-close-cart');
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('cart-drawer');

    const toggleDrawer = (open) => {
      if (open) {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    };

    if (openBtn) openBtn.addEventListener('click', () => toggleDrawer(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleDrawer(false));
    if (overlay) overlay.addEventListener('click', () => toggleDrawer(false));

    // Proceed to checkout
    const checkoutBtn = document.getElementById('btn-open-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) {
          app.showToast('Please add items to your cart first!', 'error');
          return;
        }
        toggleDrawer(false);
        app.openCheckoutModal();
      });
    }
  }
};

window.cart = cart;
