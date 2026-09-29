const initialProducts = [
  {
    id: 'prod-1',
    name: 'Aura Nexus Pro Cyber-Headset',
    slug: 'aura-nexus-pro-cyber-headset',
    category: 'Spatial Audio',
    brand: 'AURA Pulse',
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.9,
    numReviews: 128,
    badge: 'BESTSELLER',
    inStock: true,
    stockCount: 42,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Immersive spatial 3D audio with real-time dynamic head-tracking, ultra-low latency wireless DAC, cyber-luminescent RGB aura rings, and active noise cancellation (ANC -45dB).',
    specs: {
      'Frequency Response': '5Hz - 40kHz',
      'Battery Life': '65 Hours playback',
      'Connectivity': 'Bluetooth 5.4 / Ultra-low 2.4GHz Dongle',
      'Weight': '248g Titanium Chassis',
      'Noise Cancellation': 'Hybrid Active ANC (-45dB)'
    },
    features: [
      'True 360° Spatial Audio Processing with AI soundstage',
      'Custom 50mm Graphene Audio Drivers',
      'Customizable Chroma RGB rings with sound sync',
      'Quick charge: 10 mins gives 8 hours playback'
    ],
    colors: ['#6366f1', '#06b6d4', '#10b981', '#f43f5e'],
    modelType: 'torus'
  },
  {
    id: 'prod-2',
    name: 'Quantum Chrono X Holographic Watch',
    slug: 'quantum-chrono-x-holographic-watch',
    category: 'Wearables',
    brand: 'Quantum Labs',
    price: 349.00,
    originalPrice: 429.00,
    rating: 4.8,
    numReviews: 94,
    badge: 'HOT TECH',
    inStock: true,
    stockCount: 19,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Aerospace-grade titanium smartwatch equipped with a curved AMOLED display, biometric AI health sensors, satellite SOS, and customizable 3D holographic watchfaces.',
    specs: {
      'Display': '1.92" Curved AMOLED 120Hz',
      'Case Material': 'Grade 5 Titanium & Sapphire Glass',
      'Water Resistance': '100m (10 ATM)',
      'Sensors': 'ECG, SpO2, Skin Temp, Dual-band GPS',
      'Battery': '14 Days Extreme Mode'
    },
    features: [
      'Always-on 3D holographic interactive widgets',
      'Full health diagnostics & sleep stage AI coaching',
      'NFC contactless instant crypto and fiat payments',
      'Dual-frequency GPS with precision trail mapping'
    ],
    colors: ['#0f172a', '#e2e8f0', '#f59e0b'],
    modelType: 'cylinder'
  },
  {
    id: 'prod-3',
    name: 'Visionary AR Hologram Visor Goggles',
    slug: 'visionary-ar-hologram-visor-goggles',
    category: 'Vision Displays',
    brand: 'MetaSphere',
    price: 899.00,
    originalPrice: 1199.00,
    rating: 4.95,
    numReviews: 76,
    badge: 'NEW ARRIVAL',
    inStock: true,
    stockCount: 11,
    image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dual Micro-OLED 4K per-eye augmented reality spatial computer. Seamlessly blend ultra-crisp virtual displays, games, and 3D design workflows into your physical room.',
    specs: {
      'Resolution': '8K Combined (4K per eye)',
      'Field of View': '115° Ultra-Wide',
      'Tracking': '6-DoF Inside-Out + Eye & Hand Tracking',
      'Refresh Rate': '144Hz Low-Persistence',
      'Chipset': 'Dual Neural XR Processing Unit'
    },
    features: [
      'Zero-latency spatial passthrough vision with 12 cameras',
      'Intuitive hand gesture and eye-gaze navigation',
      'Floating infinite desktop monitors in real space',
      'Ultra-light carbon fiber ergonomic balance headband'
    ],
    colors: ['#3b82f6', '#8b5cf6', '#10b981'],
    modelType: 'sphere'
  },
  {
    id: 'prod-4',
    name: 'CyberBlade RGB Magnetic Keyboard',
    slug: 'cyberblade-rgb-magnetic-keyboard',
    category: 'Luxury Cyber Gear',
    brand: 'BladeForge',
    price: 189.99,
    originalPrice: 249.99,
    rating: 4.85,
    numReviews: 210,
    badge: '-25% SALE',
    inStock: true,
    stockCount: 35,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Hall-effect magnetic switches with 0.1mm adjustable actuation, CNC milled aircraft aluminum body, OLED programmable screen, and per-key reactive laser backlighting.',
    specs: {
      'Switch Type': 'Magnetic Hall-Effect (0.1mm - 4.0mm)',
      'Polling Rate': '8,000Hz Hyper-Polling',
      'Case': 'CNC Anodized Aluminum 6063',
      'Keycaps': 'Double-shot PBT Cyber-Font',
      'Connectivity': 'Tri-mode (USB-C, 2.4GHz, BT 5.3)'
    },
    features: [
      'Rapid Trigger technology for instantaneous key reset',
      'Gasket mounted silicone dampening sound structure',
      'Built-in customizable OLED GIF & Telemetry Screen',
      'Hot-swappable magnetic PCB'
    ],
    colors: ['#6366f1', '#ec4899', '#06b6d4'],
    modelType: 'box'
  },
  {
    id: 'prod-5',
    name: 'Orbiter 4K Cinema Drone with LiDAR',
    slug: 'orbiter-4k-cinema-drone-with-lidar',
    category: 'Next-Gen Tech',
    brand: 'AeroDynamics',
    price: 749.00,
    originalPrice: 899.00,
    rating: 4.92,
    numReviews: 63,
    badge: 'STAFF PICK',
    inStock: true,
    stockCount: 15,
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Autonomous cinema quadcopter equipped with 360-degree LiDAR collision avoidance, 3-axis mechanical gimbal, 4K 120fps HDR video, and 45-minute flight time.',
    specs: {
      'Camera': '1-inch CMOS 48MP (4K/120fps)',
      'Flight Time': '45 Minutes per Battery',
      'Max Range': '15km O3 Video Transmission',
      'Obstacle Avoidance': 'Omnidirectional 360° LiDAR',
      'Wind Resistance': 'Level 7 (15m/s)'
    },
    features: [
      'Autonomous AI Subject Tracking with predictive pathing',
      'Cinematic QuickShots (Rocket, Dronie, Helix, Boomerang)',
      'Foldable ultra-compact carbon arm architecture',
      'Return-to-Home failsafe with terrain mapping'
    ],
    colors: ['#334155', '#e2e8f0', '#0ea5e9'],
    modelType: 'octahedron'
  },
  {
    id: 'prod-6',
    name: 'Aether Pod Ambient Levitating Speaker',
    slug: 'aether-pod-ambient-levitating-speaker',
    category: 'Spatial Audio',
    brand: 'Aether Acoustic',
    price: 219.00,
    originalPrice: 289.00,
    rating: 4.78,
    numReviews: 112,
    badge: '3D AUDIO',
    inStock: true,
    stockCount: 28,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Electromagnetic magnetic levitation sound orb that floats and spins in mid-air over a glowing acoustic base with deep 360-degree bass projection.',
    specs: {
      'Output Power': '40W Peak Stereo Bass',
      'Levitation Gap': '18mm Magnetic Field',
      'Battery': '16 Hours Floating Playback',
      'Lighting': '32 Ambient RGB Breathing Modes',
      'Base Function': 'Wireless Qi Fast Charging Dock'
    },
    features: [
      'True floating magnetic levitation with zero friction',
      'Room-filling 360° omnidirectional audio dispersion',
      'Smart touch controls with gesture sensitivity',
      'Subwoofer embedded inside base station'
    ],
    colors: ['#06b6d4', '#a855f7', '#3b82f6'],
    modelType: 'icosahedron'
  },
  {
    id: 'prod-7',
    name: 'NeuralGrip Haptic Pro Gaming Mouse',
    slug: 'neuralgrip-haptic-pro-gaming-mouse',
    category: 'Luxury Cyber Gear',
    brand: 'BladeForge',
    price: 129.99,
    originalPrice: 169.99,
    rating: 4.88,
    numReviews: 180,
    badge: 'LIGHTSPEED',
    inStock: true,
    stockCount: 50,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1626218174358-7769486c4b79?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Ultra-lightweight 49-gram magnesium alloy mouse featuring 32,000 DPI optical sensor, optical switches, and customizable haptic force feedback.',
    specs: {
      'Sensor': 'AuraFocus 32K Optical (99.8% resolution)',
      'Weight': '49g Featherlight Magnesium Mesh',
      'Switches': 'Optical Microswitch (100M Clicks)',
      'Battery': '90 Hours Continuous Wireless',
      'Polling Rate': '4,000Hz Wireless True'
    },
    features: [
      'Magnesium alloy exoskeleton for zero flex and cooling',
      'Pure PTFE glide skates with rounded edges',
      'Zero smoothing, acceleration or filtering',
      'Onboard memory for 5 DPI and macro profiles'
    ],
    colors: ['#10b981', '#6366f1', '#f43f5e'],
    modelType: 'cone'
  },
  {
    id: 'prod-8',
    name: 'Lumina Smart Prism Lamp & Diffuser',
    slug: 'lumina-smart-prism-lamp-diffuser',
    category: 'Smart Home',
    brand: 'Lumina Tech',
    price: 159.00,
    originalPrice: 199.00,
    rating: 4.75,
    numReviews: 88,
    badge: 'HOT TECH',
    inStock: true,
    stockCount: 22,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Crystalline geometric smart lamp that projects dynamic aurora waveforms synced to music, featuring ultrasound aromatherapy and circadian rhythm wake-up lighting.',
    specs: {
      'Lighting': '16.8M RGBIC with animated scene effects',
      'Smart Integrations': 'Matter, HomeKit, Google, Alexa',
      'Diffuser Capacity': '350ml Ultrasonic Mist',
      'Material': 'Frosted Acrylic Crystal & Anodized Base',
      'Power': 'USB-C Fast PD Powered'
    },
    features: [
      'Circadian sync gently awakens you with sunrise simulation',
      'Built-in ambient sound machine (rain, waves, binaural)',
      'Sound reactive aurora light engine',
      'App control with schedule automation'
    ],
    colors: ['#a855f7', '#ec4899', '#38bdf8'],
    modelType: 'dodecahedron'
  }
];

const initialCoupons = [
  { code: 'ALPHA20', discountPercent: 20, description: '20% Off Storewide' },
  { code: 'CYBER50', discountPercent: 50, description: '50% Off (VIP Special)' },
  { code: 'WELCOME10', discountPercent: 10, description: '10% Welcome Discount' },
  { code: 'FREESHIP', discountPercent: 0, freeShipping: true, description: 'Free Express Shipping' }
];

module.exports = { initialProducts, initialCoupons };
