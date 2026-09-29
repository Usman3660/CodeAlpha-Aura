// ==========================================================================
// AURA 3D — Three.js Interactive 3D Graphics Engine
// ==========================================================================

const ThreeEngine = {
  hero: {
    scene: null,
    camera: null,
    renderer: null,
    coreMesh: null,
    wireMesh: null,
    rings: [],
    particles: null,
    isDragging: false,
    prevMousePos: { x: 0, y: 0 },
    container: null
  },

  productViewer: {
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    wire: null,
    animationId: null,
    currentColor: '#6366f1',
    currentGeometryType: 'torus'
  },

  // Initialize Hero 3D Interactive Canvas
  initHero() {
    const container = document.getElementById('three-hero-container');
    if (!container || !window.THREE) return;
    this.hero.container = container;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;
    camera.position.y = 0.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x06b6d4, 3, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 3, 50);
    pointLight2.position.set(-5, -3, 4);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x6366f1, 2, 50);
    pointLight3.position.set(0, -6, -4);
    scene.add(pointLight3);

    // Main 3D Core: Torus Knot Cyber Artifact
    const coreGeo = new THREE.TorusKnotGeometry(1.4, 0.38, 128, 32, 2, 3);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e1b4b,
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      transmission: 0.2,
      ior: 1.5
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Wireframe Glow Overlay
    const wireGeo = new THREE.TorusKnotGeometry(1.41, 0.39, 64, 16, 2, 3);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // Orbital Tech Rings
    const rings = [];
    const ringRadii = [2.6, 3.1, 3.5];
    const ringColors = [0x6366f1, 0x06b6d4, 0xec4899];

    ringRadii.forEach((radius, i) => {
      const ringGeo = new THREE.RingGeometry(radius, radius + 0.03, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[i],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / (2 + i * 0.4);
      ringMesh.rotation.y = (i * Math.PI) / 3;
      scene.add(ringMesh);
      rings.push(ringMesh);
    });

    // Ambient Cyber Particle Field
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = (Math.random() - 0.5) * 16;
      particlePositions[i + 2] = (Math.random() - 0.5) * 16;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    this.hero = {
      scene,
      camera,
      renderer,
      coreMesh,
      wireMesh,
      rings,
      particles,
      isDragging: false,
      prevMousePos: { x: 0, y: 0 },
      container
    };

    // Mouse Interaction Handlers
    this.bindHeroInteractions();

    // Resize Handler
    window.addEventListener('resize', () => this.onHeroResize());

    // Animation Loop
    this.animateHero();
  },

  bindHeroInteractions() {
    const { container } = this.hero;
    if (!container) return;

    container.addEventListener('mousedown', (e) => {
      this.hero.isDragging = true;
      this.hero.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.hero.isDragging = false;
    });

    container.addEventListener('mousemove', (e) => {
      if (this.hero.isDragging) {
        const deltaX = e.clientX - this.hero.prevMousePos.x;
        const deltaY = e.clientY - this.hero.prevMousePos.y;

        if (this.hero.coreMesh) {
          this.hero.coreMesh.rotation.y += deltaX * 0.01;
          this.hero.coreMesh.rotation.x += deltaY * 0.01;
          this.hero.wireMesh.rotation.y += deltaX * 0.01;
          this.hero.wireMesh.rotation.x += deltaY * 0.01;
        }

        this.hero.prevMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    // Touch events for mobile devices
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.hero.isDragging = true;
        this.hero.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.hero.isDragging = false;
    });

    container.addEventListener('touchmove', (e) => {
      if (this.hero.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.hero.prevMousePos.x;
        const deltaY = e.touches[0].clientY - this.hero.prevMousePos.y;

        if (this.hero.coreMesh) {
          this.hero.coreMesh.rotation.y += deltaX * 0.01;
          this.hero.coreMesh.rotation.x += deltaY * 0.01;
          this.hero.wireMesh.rotation.y += deltaX * 0.01;
          this.hero.wireMesh.rotation.x += deltaY * 0.01;
        }

        this.hero.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });
  },

  animateHero() {
    requestAnimationFrame(() => this.animateHero());

    const { coreMesh, wireMesh, rings, particles, renderer, scene, camera, isDragging } = this.hero;

    if (!renderer || !scene || !camera) return;

    if (!isDragging && coreMesh) {
      coreMesh.rotation.y += 0.008;
      coreMesh.rotation.x += 0.004;
      wireMesh.rotation.y += 0.008;
      wireMesh.rotation.x += 0.004;
    }

    if (rings && rings.length) {
      rings[0].rotation.z += 0.005;
      rings[1].rotation.z -= 0.007;
      rings[2].rotation.z += 0.004;
    }

    if (particles) {
      particles.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
  },

  onHeroResize() {
    const { container, camera, renderer } = this.hero;
    if (!container || !camera || !renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  },

  // ========================================================================
  // Product Details 3D Interactive Model Visualizer
  // ========================================================================
  initProductViewer(containerId, modelType = 'torus', colorHex = '#6366f1') {
    const container = document.getElementById(containerId);
    if (!container || !window.THREE) return;

    if (this.productViewer.animationId) {
      cancelAnimationFrame(this.productViewer.animationId);
    }

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(amb);
    const p1 = new THREE.PointLight(0x06b6d4, 3, 30);
    p1.position.set(4, 4, 4);
    scene.add(p1);
    const p2 = new THREE.PointLight(0xec4899, 2.5, 30);
    p2.position.set(-4, -4, 4);
    scene.add(p2);

    // Create Geometry based on modelType
    let geo;
    switch (modelType) {
      case 'cylinder':
        geo = new THREE.CylinderGeometry(0.9, 0.9, 1.4, 32);
        break;
      case 'sphere':
        geo = new THREE.SphereGeometry(1.2, 32, 32);
        break;
      case 'box':
        geo = new THREE.BoxGeometry(1.8, 0.9, 1.2);
        break;
      case 'octahedron':
        geo = new THREE.OctahedronGeometry(1.3, 0);
        break;
      case 'icosahedron':
        geo = new THREE.IcosahedronGeometry(1.3, 1);
        break;
      case 'cone':
        geo = new THREE.ConeGeometry(1.1, 1.8, 32);
        break;
      case 'dodecahedron':
        geo = new THREE.DodecahedronGeometry(1.2, 0);
        break;
      case 'torus':
      default:
        geo = new THREE.TorusGeometry(1.1, 0.45, 32, 64);
        break;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.7,
      roughness: 0.2,
      clearcoat: 0.9,
      reflectivity: 0.8
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const wire = new THREE.Mesh(geo, wireMat);
    scene.add(wire);

    this.productViewer = {
      scene,
      camera,
      renderer,
      mesh,
      wire,
      animationId: null,
      currentColor: colorHex,
      currentGeometryType: modelType
    };

    // Interaction Drag for Product Model
    let isDragging = false;
    let prevPos = { x: 0, y: 0 };

    container.onmousedown = (e) => {
      isDragging = true;
      prevPos = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mouseup', () => { isDragging = false; });

    container.onmousemove = (e) => {
      if (isDragging && mesh) {
        const dx = e.clientX - prevPos.x;
        const dy = e.clientY - prevPos.y;
        mesh.rotation.y += dx * 0.015;
        mesh.rotation.x += dy * 0.015;
        wire.rotation.y += dx * 0.015;
        wire.rotation.x += dy * 0.015;
        prevPos = { x: e.clientX, y: e.clientY };
      }
    };

    const renderLoop = () => {
      if (!isDragging && mesh) {
        mesh.rotation.y += 0.01;
        mesh.rotation.x += 0.005;
        wire.rotation.y += 0.01;
        wire.rotation.x += 0.005;
      }
      renderer.render(scene, camera);
      this.productViewer.animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  },

  updateProductColor(hex) {
    if (this.productViewer.mesh) {
      this.productViewer.mesh.material.color.set(hex);
      this.productViewer.currentColor = hex;
    }
  }
};

window.ThreeEngine = ThreeEngine;
