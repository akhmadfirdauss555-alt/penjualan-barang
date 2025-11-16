/**
 * MEJA CAFE PALU - Main JavaScript
 * Modular and maintainable code structure
 */

// ===================================
// 1. CONFIGURATION & CONSTANTS
// ===================================
const CONFIG = {
  SCROLL_THRESHOLD: 8,
  ANIMATION_THRESHOLD: 0.1,
  SMOOTH_SCROLL_DURATION: 300,
  WHATSAPP_NUMBER: '6285220888840'
};

// ===================================
// 2. UTILITY FUNCTIONS
// ===================================
const Utils = {
  formatMoney: (num) => 'Rp ' + (Number(num) || 0).toLocaleString('id-ID'),
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ===================================
// 3. ANIMATION MODULE
// ===================================
const AnimationModule = {
  init() {
    this.setupScrollAnimations();
    this.setupSmoothScroll();
    this.setupStickyNav();
  },

  setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: CONFIG.ANIMATION_THRESHOLD });

    animatedElements.forEach((el, i) => {
      el.style.setProperty('--animation-order', i % 4);
      observer.observe(el);
    });
  },

  setupSmoothScroll() {
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      });
    });
  },

  setupStickyNav() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const handleScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > CONFIG.SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener('scroll', Utils.debounce(handleScroll, 10), { passive: true });
  }
};

// ===================================
// 4. FILTER MODULE
// ===================================
const FilterModule = {
  init() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.menuItems = document.querySelectorAll('.menu-item');
    this.setupFilters();
  },

  setupFilters() {
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => this.handleFilterClick(btn));
    });
  },

  handleFilterClick(selectedBtn) {
    // Update active state
    this.filterButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    
    selectedBtn.classList.add('active');
    selectedBtn.setAttribute('aria-selected', 'true');

    // Filter items
    const filter = selectedBtn.dataset.filter;
    this.filterItems(filter);
  },

  filterItems(filter) {
    this.menuItems.forEach(item => {
      const shouldShow = filter === 'all' || item.dataset.category === filter;
      item.style.display = shouldShow ? 'flex' : 'none';
    });
  }
};

// ===================================
// 5. CART MODULE
// ===================================
const CartModule = {
  cart: [],

  init() {
    this.initElements();
    this.setupEventListeners();
    this.updateUI();
  },

  initElements() {
    this.cartToggle = document.getElementById('cart-toggle');
    this.cartDropdown = document.querySelector('.cart-dropdown');
    this.cartList = this.cartDropdown?.querySelector('.cart-list');
    this.cartTotal = this.cartDropdown?.querySelector('.cart-total');
    this.cartEmpty = this.cartDropdown?.querySelector('.cart-empty');
    this.cartCount = document.querySelector('.cart-count');
    this.clearBtn = this.cartDropdown?.querySelector('.cart-clear');
    this.checkoutBtn = this.cartDropdown?.querySelector('.cart-checkout');
  },

  setupEventListeners() {
    // Toggle cart dropdown
    this.cartToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = this.cartToggle.getAttribute('aria-expanded') === 'true';
      this.cartToggle.setAttribute('aria-expanded', !isExpanded);
      this.cartDropdown.classList.toggle('show');
    });

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.cartToggle?.contains(e.target) && !this.cartDropdown?.contains(e.target)) {
        this.cartToggle?.setAttribute('aria-expanded', 'false');
        this.cartDropdown?.classList.remove('show');
      }
    });

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuItem = btn.closest('.menu-item');
        this.addToCart(menuItem);
      });
    });

    // Clear cart
    this.clearBtn?.addEventListener('click', () => this.clearCart());

    // Checkout
    this.checkoutBtn?.addEventListener('click', () => this.checkout());
  },

  addToCart(menuItem) {
    const itemData = {
      name: menuItem.querySelector('h3').textContent,
      price: 0, // Price will be discussed via WhatsApp
      img: menuItem.querySelector('img').src,
      qty: 1
    };

    const existingItem = this.cart.find(item => item.name === itemData.name);
    
    if (existingItem) {
      existingItem.qty++;
    } else {
      this.cart.push(itemData);
    }

    this.updateUI();
  },

  removeFromCart(index) {
    this.cart.splice(index, 1);
    this.updateUI();
  },

  updateQuantity(index, change) {
    if (this.cart[index]) {
      this.cart[index].qty += change;
      
      if (this.cart[index].qty <= 0) {
        this.removeFromCart(index);
      } else {
        this.updateUI();
      }
    }
  },

  clearCart() {
    if (confirm('Hapus semua item dari keranjang?')) {
      this.cart = [];
      this.updateUI();
    }
  },

  checkout() {
    if (this.cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    const message = this.generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  },

  generateWhatsAppMessage() {
    let message = '*PESANAN FURNITURE CAFE*\n\n';
    
    this.cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Jumlah: ${item.qty} unit\n\n`;
    });

    message += '\nMohon info harga dan ketersediaan produk. Terima kasih!';
    return message;
  },

  updateUI() {
    this.updateCartList();
    this.updateCartBadge();
    this.updateCartEmpty();
  },

  updateCartList() {
    if (!this.cartList) return;

    this.cartList.innerHTML = '';
    
    this.cart.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="cart-thumb" />
        <span class="cart-item-name" title="Lihat detail">${item.name}</span>
        <div class="cart-item-controls">
          <button class="decrease" aria-label="Kurangi jumlah">-</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="increase" aria-label="Tambah jumlah">+</button>
        </div>
        <span class="cart-item-price">${item.qty} unit</span>
      `;

      // Event listeners for quantity controls
      li.querySelector('.increase').addEventListener('click', (e) => {
        e.stopPropagation();
        this.updateQuantity(index, 1);
      });

      li.querySelector('.decrease').addEventListener('click', (e) => {
        e.stopPropagation();
        this.updateQuantity(index, -1);
      });

      li.querySelector('.cart-item-name').addEventListener('click', (e) => {
        e.stopPropagation();
        alert(`Detail Produk:\n\n${item.name}\nJumlah: ${item.qty} unit\n\nHubungi kami untuk info harga!`);
      });

      this.cartList.appendChild(li);
    });
  },

  updateCartBadge() {
    if (!this.cartCount) return;
    
    const totalItems = this.cart.reduce((sum, item) => sum + item.qty, 0);
    this.cartCount.textContent = totalItems;
  },

  updateCartEmpty() {
    if (!this.cartEmpty) return;
    
    this.cartEmpty.style.display = this.cart.length === 0 ? 'block' : 'none';
  }
};

// ===================================
// 6. IMAGE ZOOM MODULE
// ===================================
const ImageZoomModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.modalCaption = document.querySelector('.modal-caption');
    this.closeBtn = document.querySelector('.modal-close');

    if (!this.modal) return;

    this.setupEventListeners();
  },

  setupEventListeners() {
    // Click on product images
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('menu-item-img')) {
        this.openModal(e.target);
      }
    });

    // Close button
    this.closeBtn?.addEventListener('click', () => this.closeModal());

    // Click outside image
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('show')) {
        this.closeModal();
      }
    });
  },

  openModal(imgElement) {
    this.modal.classList.add('show');
    this.modalImg.src = imgElement.src;
    this.modalCaption.textContent = imgElement.alt;
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    this.modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
};

// ===================================
// 7. FAQ MODULE
// ===================================
const FAQModule = {
  init() {
    this.setupFAQToggles();
  },

  setupFAQToggles() {
    document.querySelectorAll('.faq-item').forEach(item => {
      item.addEventListener('toggle', function() {
        const icon = this.querySelector('i.fa-chevron-down');
        if (icon) {
          icon.style.transform = this.open ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      });
    });
  }
};

// ===================================
// 8. SMOOTH SCROLL LIBRARY (Lenis)
// ===================================
const SmoothScrollModule = {
  init() {
    if (typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
      lerp: 0.070,
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);
  }
};

// ===================================
// 9. MAIN INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🪑 MEJA CAFE PALU - Initializing...');

  try {
    // Initialize all modules
    AnimationModule.init();
    FilterModule.init();
    CartModule.init();
    ImageZoomModule.init();
    FAQModule.init();
    SmoothScrollModule.init();

    console.log('✅ All modules initialized successfully');
  } catch (error) {
    console.error('❌ Initialization error:', error);
  }
});
