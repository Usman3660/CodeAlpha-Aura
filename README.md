# AURA 3D — Next-Gen Cybernetic E-Commerce Platform

A feature-rich, high-performance, and visually striking 3D E-Commerce web application built with **Express.js (Node.js)**, **MongoDB / Mongoose**, **Vanilla Modern CSS**, and **Three.js**.

---

## ✨ Key Features

1. **Interactive 3D Graphics & Aesthetics**:
   - Real-time Three.js 3D Hero canvas with interactive geometry orbit, cyber particle mesh, and dynamic ambient lighting.
   - Interactive 3D Product Inspector (360° rotate, zoom, and finish/color switchers).
   - Dynamic 3D card tilt physics on hover.
   - Interactive 3D flippable credit card preview during checkout.
   - Dark glassmorphism (`backdrop-filter: blur(20px)`), neon accents, and responsive layout.

2. **Full Product Catalog**:
   - Real-time instant search with autocomplete.
   - Category filter pills with dynamic count badges.
   - Price range slider and "In Stock Only" toggle.
   - Sort by Price (Low/High), Highest Rated, and Most Reviewed.
   - Grid and List view switcher.

3. **Product Details & Customer Reviews**:
   - Comprehensive technical specifications and features list.
   - Customer review submission with star ratings and live recalculation.

4. **Shopping Cart & Checkout**:
   - Slide-out glass drawer with real-time total, tax, and discount calculation.
   - Free shipping progress bar (Free Express Shipping over $150).
   - Promo code engine (`ALPHA20` for 20% off, `CYBER50` for 50% off, `FREESHIP`).
   - Multi-step checkout with instant address validation, simulated payment processing, order confirmation, and celebration confetti.

5. **User Authentication & Orders**:
   - User Registration, Login, and Profile management with JWT authentication.
   - Order history with live order dispatch tracking stepper (`Placed` → `Processing` → `Shipped` → `Delivered`).
   - One-click demo accounts (`demo@aura.io` and `admin@aura.io`).

6. **Admin Management Hub**:
   - Add new products to the catalog with customizable 3D mesh geometries.
   - View real-time store stats (revenue, total orders, catalog items, registered users).
   - Live order status update controller.

7. **Database Resilience**:
   - Automatic connection to MongoDB - (custom `MONGODB_URI`).
   - Seamless embedded in-memory fallback layer ensuring 100% functionality even when offline.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open in Browser
Visit [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Accounts

| Name | Role | Email | Password |
|---|---|---|---|
| **Ali** | Customer Demo | `ali@aura.io` | `password123` |
| **Ahmad** | Administrator | `ahmad@aura.io` | `password123` |
| **Ayesha** | Customer | `ayesha@aura.io` | `password123` |
| **Omar** | Customer | `omar@aura.io` | `password123` |

### Promo Voucher Codes
- `ALPHA20` — 20% Discount Storewide
- `CYBER50` — 50% VIP Discount
- `WELCOME10` — 10% Welcome Discount
- `FREESHIP` — Free Express Shipping
