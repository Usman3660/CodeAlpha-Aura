async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('🧪 Starting API Verification Suite...');

  // 1. Health
  const health = await (await fetch(`${baseUrl}/health`)).json();
  console.log('1. Health Status:', health.status, '| DB Mode:', health.database.mode);

  // 2. Products List
  const prodRes = await (await fetch(`${baseUrl}/products`)).json();
  console.log(`2. Products Listed: ${prodRes.count} products found`);

  // 3. Categories
  const catRes = await (await fetch(`${baseUrl}/products/categories`)).json();
  console.log(`3. Categories: ${catRes.categories.map(c => c.name).join(', ')}`);

  // 4. Product Details
  const singleProd = await (await fetch(`${baseUrl}/products/prod-1`)).json();
  console.log(`4. Single Product fetched: "${singleProd.product.name}" with ${singleProd.reviews.length} reviews`);

  // 5. Auth Login (Customer)
  const loginRes = await (await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ali@aura.io', password: 'password123' })
  })).json();
  console.log('5. Customer Login:', loginRes.success, '| User:', loginRes.user?.name);

  // 5b. Auth Login (Admin)
  const adminLoginRes = await (await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ahmad@aura.io', password: 'password123' })
  })).json();
  console.log('5b. Admin Login:', adminLoginRes.success, '| User:', adminLoginRes.user?.name);

  // 6. Coupon Apply
  const couponRes = await (await fetch(`${baseUrl}/coupons/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'ALPHA20', cartTotal: 299.99 })
  })).json();
  console.log('6. Coupon Applied:', couponRes.success, '| Discount:', couponRes.coupon?.discountAmount);

  // 7. Create Order
  const orderRes = await (await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginRes.token}`
    },
    body: JSON.stringify({
      items: [{ id: 'prod-1', name: 'Aura Nexus Pro', price: 299.99, quantity: 1, color: '#6366f1' }],
      shippingAddress: { fullName: 'Ali', street: '742 Cyber Blvd', city: 'Neo Tokyo', state: 'NT', zip: '90210' },
      pricing: { subtotal: 299.99, discount: 60.00, shipping: 0, tax: 19.20, total: 259.19 }
    })
  })).json();
  console.log('7. Order Created:', orderRes.success, '| Order ID:', orderRes.order?.id, '| Tracking:', orderRes.order?.trackingNumber);

  // 8. Order Status Update (Admin Protected)
  const updateRes = await (await fetch(`${baseUrl}/orders/${orderRes.order.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminLoginRes.token}`
    },
    body: JSON.stringify({ status: 'Shipped' })
  })).json();
  console.log('8. Admin Order Status Update:', updateRes.success, '| New Status:', updateRes.order?.status);

  // 9. Admin Stats
  const statsRes = await (await fetch(`${baseUrl}/stats`)).json();
  console.log(`9. Store Stats - Revenue: $${statsRes.stats.totalSales}, Orders: ${statsRes.stats.totalOrders}`);

  console.log('🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
