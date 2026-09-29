// ==========================================================================
// AURA 3D — User Authentication & State Manager
// ==========================================================================

const auth = {
  currentUser: null,

  async init() {
    const token = localStorage.getItem('aura_token');
    if (token) {
      try {
        const res = await api.auth.getProfile();
        if (res && res.success && res.user) {
          this.currentUser = res.user;
        } else {
          this.logout(false);
        }
      } catch (e) {
        this.logout(false);
      }
    }
    this.renderUserUI();
    this.bindEvents();
  },

  renderUserUI() {
    const container = document.getElementById('user-menu-container');
    if (!container) return;

    if (this.currentUser) {
      container.innerHTML = `
        <div class="user-logged-btn" onclick="app.openAccountModal()">
          <div class="avatar-mini"><i class="fa-solid fa-user-astronaut"></i></div>
          <span class="user-first-name">${this.currentUser.name.split(' ')[0]}</span>
          ${this.currentUser.role === 'admin' ? '<span class="admin-chip">ADMIN</span>' : ''}
        </div>
      `;
    } else {
      container.innerHTML = `
        <button class="btn-primary-sm glow-btn" onclick="auth.openAuthModal()">
          <i class="fa-regular fa-user"></i> Sign In
        </button>
      `;
    }
  },

  bindEvents() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const res = await api.auth.login({ email, password });
        if (res.success) {
          localStorage.setItem('aura_token', res.token);
          this.currentUser = res.user;
          this.renderUserUI();
          this.closeAuthModal();
          app.showToast(`Welcome back, ${res.user.name}!`, 'success');
        } else {
          app.showToast(res.message || 'Login failed', 'error');
        }
      });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        const res = await api.auth.register({ name, email, password });
        if (res.success) {
          localStorage.setItem('aura_token', res.token);
          this.currentUser = res.user;
          this.renderUserUI();
          this.closeAuthModal();
          app.showToast('Account registered successfully!', 'success');
        } else {
          app.showToast(res.message || 'Registration failed', 'error');
        }
      });
    }
  },

  openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('active');
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
  },

  switchTab(tab) {
    const loginTab = document.getElementById('tab-login');
    const regTab = document.getElementById('tab-register');
    const loginPane = document.getElementById('pane-login');
    const regPane = document.getElementById('pane-register');

    if (tab === 'login') {
      loginTab.classList.add('active');
      regTab.classList.remove('active');
      loginPane.classList.remove('hide');
      regPane.classList.add('hide');
    } else {
      regTab.classList.add('active');
      loginTab.classList.remove('active');
      regPane.classList.remove('hide');
      loginPane.classList.add('hide');
    }
  },

  fillDemo(email, pass) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = pass;
    this.switchTab('login');
  },

  logout(showNotice = true) {
    localStorage.removeItem('aura_token');
    this.currentUser = null;
    this.renderUserUI();
    const accModal = document.getElementById('account-modal');
    if (accModal) accModal.classList.remove('active');
    if (showNotice) app.showToast('Logged out securely', 'info');
  }
};

window.auth = auth;
