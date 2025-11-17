/**
 * MEJA CAFE PALU - Main Application
 * Clean Code & OOP Architecture
 * @version 2.1
 * @author Development Team
 */

'use strict';

// ============================================
// CONFIGURATION
// ============================================
class AppConfig {
  static SCROLL_THRESHOLD = 8;
  static ANIMATION_THRESHOLD = 0.1;
  static WHATSAPP_NUMBER = '6285220888840';
  static DEBOUNCE_DELAY = 10;
}

// ============================================
// UTILITIES
// ============================================
class Utils {
  /**
   * Format number to Indonesian Rupiah
   * @param {number} amount - The amount to format
   * @returns {string} Formatted currency string
   */
  static formatCurrency(amount) {
    const numericAmount = Number(amount) || 0;
    return `Rp ${numericAmount.toLocaleString('id-ID')}`;
  }

  /**
   * Debounce function calls
   * @param {Function} callback - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(callback, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback.apply(this, args), delay);
    };
  }

  /**
   * Check if element exists in DOM
   * @param {string} selector - CSS selector
   * @returns {boolean}
   */
  static elementExists(selector) {
    return document.querySelector(selector) !== null;
  }

  /**
   * Safe query selector with error handling
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null}
   */
  static safeQuerySelector(selector) {
    try {
      return document.querySelector(selector);
    } catch (error) {
      return null;
    }
  }
}

// ============================================
// BASE MODULE CLASS
// ============================================
class BaseModule {
  constructor(name) {
    this.name = name;
    this.initialized = false;
  }

  /**
   * Initialize module
   * @abstract
   */
  init() {
    throw new Error('init() must be implemented by subclass');
  }

  /**
   * Log initialization status
   * @param {boolean} success - Whether initialization was successful
   */
  logInitialization(success) {
    this.initialized = success;
  }
}

// ============================================
// ANIMATION MODULE
// ============================================
class AnimationController extends BaseModule {
  constructor() {
    super('AnimationController');
    this.observer = null;
    this.navElement = null;
  }

  init() {
    try {
      this.setupScrollAnimations();
      this.setupSmoothScroll();
      this.setupStickyNavigation();
      this.logInitialization(true);
    } catch (error) {
      this.logInitialization(false);
    }
  }

  setupScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) return;

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { threshold: AppConfig.ANIMATION_THRESHOLD }
    );

    elements.forEach((element, index) => {
      element.style.setProperty('--animation-order', index % 4);
      this.observer.observe(element);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }

  setupSmoothScroll() {
    const anchors = document.querySelectorAll('nav a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', this.handleAnchorClick.bind(this));
    });
  }

  handleAnchorClick(event) {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  setupStickyNavigation() {
    this.navElement = Utils.safeQuerySelector('nav');
    if (!this.navElement) return;

    const handleScroll = Utils.debounce(() => {
      this.updateNavigationState();
    }, AppConfig.DEBOUNCE_DELAY);

    this.updateNavigationState();
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  updateNavigationState() {
    if (!this.navElement) return;
    
    const shouldBeScrolled = window.scrollY > AppConfig.SCROLL_THRESHOLD;
    this.navElement.classList.toggle('scrolled', shouldBeScrolled);
  }
}

// ============================================
// FILTER MODULE
// ============================================
class ProductFilter extends BaseModule {
  constructor() {
    super('ProductFilter');
    this.filterButtons = [];
    this.productItems = [];
    this.activeFilter = 'all';
  }

  init() {
    try {
      this.cacheElements();
      this.attachEventListeners();
      this.logInitialization(true);
    } catch (error) {
      this.logInitialization(false);
    }
  }
  cacheElements() {
    this.filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    this.productItems = Array.from(document.querySelectorAll('.menu-item'));
  }

  attachEventListeners() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', () => this.handleFilterClick(button));
    });
  }

  handleFilterClick(selectedButton) {
    this.updateActiveButton(selectedButton);
    this.activeFilter = selectedButton.dataset.filter;
    this.filterProducts();
  }

  updateActiveButton(selectedButton) {
    this.filterButtons.forEach(button => {
      const isSelected = button === selectedButton;
      button.classList.toggle('active', isSelected);
      button.setAttribute('aria-selected', isSelected.toString());
    });
  }

  filterProducts() {
    this.productItems.forEach(item => {
      const category = item.dataset.category;
      const shouldDisplay = this.shouldDisplayItem(category);
      item.style.display = shouldDisplay ? 'flex' : 'none';
    });
  }

  shouldDisplayItem(category) {
    return this.activeFilter === 'all' || category === this.activeFilter;
  }
}

// ============================================
// CART MODULE
// ============================================
class ShoppingCart extends BaseModule {
  constructor() {
    super('ShoppingCart');
    this.items = [];
    this.elements = {};
  }

  init() {
    try {
      this.cacheElements();
      this.attachEventListeners();
      this.render();
      this.logInitialization(true);
    } catch (error) {
      this.logInitialization(false);
    }
  }

  cacheElements() {
    this.elements = {
      toggle: document.getElementById('cart-toggle'),
      dropdown: Utils.safeQuerySelector('.cart-dropdown'),
      list: Utils.safeQuerySelector('.cart-list'),
      total: Utils.safeQuerySelector('.cart-total'),
      empty: Utils.safeQuerySelector('.cart-empty'),
      badge: Utils.safeQuerySelector('.cart-count'),
      clearBtn: Utils.safeQuerySelector('.cart-clear'),
      checkoutBtn: Utils.safeQuerySelector('.cart-checkout')
    };
  }

  attachEventListeners() {
    // Toggle cart dropdown
    this.elements.toggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Close cart on outside click
    document.addEventListener('click', (e) => {
      this.handleOutsideClick(e);
    });

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.addItemFromButton(button);
      });
    });

    // Cart actions
    this.elements.clearBtn?.addEventListener('click', () => this.clear());
    this.elements.checkoutBtn?.addEventListener('click', () => this.checkout());
  }

  toggleDropdown() {
    const isExpanded = this.elements.toggle.getAttribute('aria-expanded') === 'true';
    this.elements.toggle.setAttribute('aria-expanded', (!isExpanded).toString());
    this.elements.dropdown?.classList.toggle('open');
  }

  handleOutsideClick(event) {
    const isInsideCart = this.elements.toggle?.contains(event.target) ||
                        this.elements.dropdown?.contains(event.target);
    
    if (!isInsideCart) {
      this.elements.toggle?.setAttribute('aria-expanded', 'false');
      this.elements.dropdown?.classList.remove('open');
    }
  }

  addItemFromButton(button) {
    const productElement = button.closest('.menu-item');
    if (!productElement) return;

    const product = this.extractProductData(productElement);
    this.addItem(product);
  }

  extractProductData(productElement) {
    const priceValue = parseInt(productElement.dataset.price) || 0;
    
    return {
      name: productElement.querySelector('h3')?.textContent || 'Unknown',
      price: priceValue,
      image: productElement.querySelector('img')?.src || '',
      quantity: 1
    };
  }

  addItem(product) {
    const existingItem = this.findItemByName(product.name);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.items.push({ ...product });
    }

    this.render();
  }

  findItemByName(name) {
    return this.items.find(item => item.name === name);
  }

  updateQuantity(index, delta) {
    if (!this.items[index]) return;

    this.items[index].quantity += delta;

    if (this.items[index].quantity <= 0) {
      this.removeItem(index);
    } else {
      this.render();
    }
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.render();
  }

  clear() {
    if (confirm('Hapus semua item dari keranjang?')) {
      this.items = [];
      this.render();
    }
  }

  checkout() {
    if (this.isEmpty()) {
      alert('Keranjang masih kosong!');
      return;
    }

    const message = this.generateWhatsAppMessage();
    const url = this.buildWhatsAppUrl(message);
    window.open(url, '_blank');
  }

  isEmpty() {
    return this.items.length === 0;
  }

  generateWhatsAppMessage() {
    let message = '*PESANAN FURNITURE CAFE*\n\n';
    let totalAmount = 0;

    this.items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;
      
      message += `${index + 1}. ${item.name}\n`;
      message += `   Jumlah: ${item.quantity} unit\n`;
      message += `   Harga: ${Utils.formatCurrency(item.price)}\n`;
      message += `   Subtotal: ${Utils.formatCurrency(itemTotal)}\n\n`;
    });

    message += `*TOTAL: ${Utils.formatCurrency(totalAmount)}*\n\n`;
    message += 'Mohon konfirmasi ketersediaan dan proses pemesanan. Terima kasih!';
    return message;
  }

  buildWhatsAppUrl(message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${AppConfig.WHATSAPP_NUMBER}?text=${encodedMessage}`;
  }

  render() {
    this.renderCartList();
    this.updateBadge();
    this.updateTotal();
    this.updateEmptyState();
  }

  renderCartList() {
    if (!this.elements.list) return;

    this.elements.list.innerHTML = '';

    this.items.forEach((item, index) => {
      const itemElement = this.createCartItemElement(item, index);
      this.elements.list.appendChild(itemElement);
    });
  }

  createCartItemElement(item, index) {
    const li = document.createElement('li');
    li.className = 'cart-item';
    
    const totalPrice = item.price * item.quantity;
    const formattedPrice = Utils.formatCurrency(totalPrice);
    
    li.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-thumb" />
      <div class="cart-item-info">
        <span class="cart-item-name" title="Lihat detail">${item.name}</span>
        <span class="cart-item-price">${formattedPrice}</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn decrease" aria-label="Kurangi jumlah">−</button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="qty-btn increase" aria-label="Tambah jumlah">+</button>
      </div>
    `;

    this.attachItemEventListeners(li, item, index);
    return li;
  }

  attachItemEventListeners(element, item, index) {
    element.querySelector('.increase')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.updateQuantity(index, 1);
    });

    element.querySelector('.decrease')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.updateQuantity(index, -1);
    });

    element.querySelector('.cart-item-name')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showItemDetails(item);
    });
  }

  showItemDetails(item) {
    const message = `Detail Produk:\n\n${item.name}\nJumlah: ${item.quantity} unit\n\nHubungi kami untuk info harga!`;
    alert(message);
  }

  updateBadge() {
    if (!this.elements.badge) return;

    const totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.elements.badge.textContent = totalQuantity.toString();
  }

  updateTotal() {
    if (!this.elements.total) return;

    const totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.elements.total.textContent = Utils.formatCurrency(totalAmount);
  }

  updateEmptyState() {
    if (!this.elements.empty) return;

    this.elements.empty.style.display = this.isEmpty() ? 'block' : 'none';
  }
}

// ============================================
// IMAGE ZOOM MODULE
// ============================================
class ImageZoom extends BaseModule {
  constructor() {
    super('ImageZoom');
    this.elements = {};
    this.isOpen = false;
  }

  init() {
    try {
      this.cacheElements();
      if (!this.elements.modal) {
        return;
      }
      this.attachEventListeners();
      this.logInitialization(true);
    } catch (error) {
      this.logInitialization(false);
    }
  }

  cacheElements() {
    this.elements = {
      modal: document.getElementById('image-modal'),
      image: document.getElementById('modal-img'),
      caption: Utils.safeQuerySelector('.modal-caption'),
      closeBtn: Utils.safeQuerySelector('.modal-close')
    };
  }

  attachEventListeners() {
    // Click on product images
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('menu-item-img')) {
        this.open(e.target);
      }
    });

    // Close button
    this.elements.closeBtn?.addEventListener('click', () => this.close());

    // Click outside
    this.elements.modal?.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) {
        this.close();
      }
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(imageElement) {
    if (!this.elements.modal) return;

    this.elements.modal.classList.add('show');
    this.elements.image.src = imageElement.src;
    this.elements.caption.textContent = imageElement.alt;
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
  }

  close() {
    if (!this.elements.modal) return;

    this.elements.modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    this.isOpen = false;
  }
}

// ============================================
// FAQ MODULE
// ============================================
class FAQAccordion extends BaseModule {
  constructor() {
    super('FAQAccordion');
    this.faqItems = [];
  }

  init() {
    try {
      this.cacheFAQItems();
      this.attachEventListeners();
      this.logInitialization(true);
    } catch (error) {
      this.logInitialization(false);
    }
  }

  cacheFAQItems() {
    this.faqItems = Array.from(document.querySelectorAll('.faq-item'));
  }

  attachEventListeners() {
    this.faqItems.forEach(item => {
      item.addEventListener('toggle', () => this.handleToggle(item));
    });
  }

  handleToggle(item) {
    const icon = item.querySelector('i.fa-chevron-down');
    if (!icon) return;

    const rotation = item.open ? '180deg' : '0deg';
    icon.style.transform = `rotate(${rotation})`;
  }
}

// ============================================
// SMOOTH SCROLL MODULE
// ============================================
class SmoothScrollController extends BaseModule {
  constructor() {
    super('SmoothScrollController');
    this.lenis = null;
  }

  init() {
    try {
      if (typeof Lenis === 'undefined') {
        return;
      }

      this.initializeLenis();
      this.logInitialization(true);
    } catch (error) {
      this.logInitialization(false);
    }
  }

  initializeLenis() {
    this.lenis = new Lenis({
      lerp: 0.070,
      smoothWheel: true,
    });

    this.startAnimationLoop();
  }

  startAnimationLoop() {
    const animate = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}

// ============================================
// APPLICATION CONTROLLER
// ============================================
class Application {
  constructor() {
    this.modules = [];
    this.initialized = false;
  }

  /**
   * Register module for initialization
   * @param {BaseModule} module - Module instance to register
   */
  register(module) {
    if (!(module instanceof BaseModule)) {
      return;
    }
    this.modules.push(module);
  }

  /**
   * Initialize all registered modules
   */
  async init() {
    try {
      this.modules.forEach(module => {
        module.init();
      });

      this.initialized = true;
    } catch (error) {
      // Silent fail in production
    }
  }

  /**
   * Get initialization status
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized;
  }
}

// ============================================
// INSTAGRAM CAROUSEL MODULE
// ============================================
class InstagramCarousel extends BaseModule {
  constructor() {
    super('InstagramCarousel');
    this.carousel = null;
    this.carouselContainer = null;
    this.posts = [];
    this.allPosts = []; // Pool lengkap semua posts
    this.currentIndex = 0;
    this.postsPerView = 3;
    this.isLoading = false;
    this.autoplayInterval = null;
    this.autoplayDelay = 5000;
    this.refreshInterval = null;
    this.refreshDelay = 30000; // Refresh setiap 30 detik
    this.maxDisplayPosts = 6; // Maksimal posts yang ditampilkan
  }

  init() {
    try {
      this.cacheElements();
      if (this.carousel) {
        this.initializeAllPosts();
        this.loadInstagramPosts();
        this.setupEventListeners();
        this.setupTouchEvents();
        this.startAutoRefresh();
        this.logInitialization(true);
      }
    } catch (error) {
      console.error('Instagram Carousel initialization error:', error);
      this.logInitialization(false);
    }
  }

  cacheElements() {
    this.carousel = document.getElementById('instagram-carousel');
    this.carouselContainer = document.querySelector('.carousel-container');
    this.prevButton = document.getElementById('carousel-prev');
    this.nextButton = document.getElementById('carousel-next');
    this.dotsContainer = document.getElementById('carousel-dots');
  }

  initializeAllPosts() {
    // Pool lengkap semua posts yang tersedia
    this.allPosts = [
      {
        id: '1',
        username: 'meja_cafe.plw',
        location: 'Palu, Sulawesi Tengah',
        image: 'assets2/meja/4 meja 1 kursi.jpeg',
        avatar: 'assets2/logo/logo.jpg',
        likes: 143,
        caption: '✨ Set meja cafe minimalis dengan 4 kursi yang nyaman! Perfect untuk cafe kecil dengan nuansa cozy dan modern.',
        hashtags: '#mejacafe #furnituredesign #coffeeshop #minimalist #interior',
        category: 'meja',
        priority: 1,
        baseTimestamp: Date.now() - (2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2', 
        username: 'meja_cafe.plw',
        location: 'Palu, Sulawesi Tengah',
        image: 'assets2/sofa/Sofa Esty.jpeg',
        avatar: 'assets2/logo/logo.jpg',
        likes: 89,
        caption: '🛋️ Sofa Esty series - kenyamanan premium untuk area lounge cafe Anda! Design elegant dengan material berkualitas.',
        hashtags: '#sofacafe #premium #comfort #lounge #furniture',
        category: 'sofa',
        priority: 2,
        baseTimestamp: Date.now() - (4 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        username: 'meja_cafe.plw',
        location: 'Palu, Sulawesi Tengah',
        image: 'assets2/set/Coffe table set.jpeg',
        avatar: 'assets2/logo/logo.jpg',
        likes: 156,
        caption: '☕ Coffee table set dengan design industrial modern! Cocok untuk outdoor maupun indoor dengan style yang timeless.',
        hashtags: '#coffeetable #industrial #outdoor #stylish #modern',
        category: 'set',
        priority: 1,
        baseTimestamp: Date.now() - (7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        username: 'meja_cafe.plw',
        location: 'Palu, Sulawesi Tengah',
        image: 'assets2/meja/Meja komputer gaming.jpeg',
        avatar: 'assets2/logo/logo.jpg',
        likes: 201,
        caption: '🎮 Meja gaming yang multifunctional! Bisa untuk workspace cafe dengan storage yang praktis dan cable management rapi.',
        hashtags: '#mejagaming #workspace #multifunctional #modern #storage',
        category: 'meja',
        priority: 3,
        baseTimestamp: Date.now() - (8 * 24 * 60 * 60 * 1000)
      },
      {
        id: '5',
        username: 'meja_cafe.plw',
        location: 'Palu, Sulawesi Tengah',
        image: 'assets2/sofa/Sofa gucchi 2 seater.jpeg',
        avatar: 'assets2/logo/logo.jpg',
        likes: 342,
        caption: '💎 Sofa Gucci 2 seater - luxury meets comfort! Design eksklusif untuk area VIP cafe dengan material premium.',
        hashtags: '#sofagucci #luxury #vip #exclusive #premium #comfort',
        category: 'sofa',
        priority: 1,
        baseTimestamp: Date.now() - (14 * 24 * 60 * 60 * 1000)
      },
      {
        id: '6',
        username: 'meja_cafe.plw',
        location: 'Palu, Sulawesi Tengah',
        image: 'assets2/set/Set couple ropan busa.jpeg',
        avatar: 'assets2/logo/logo.jpg',
        likes: 97,
        caption: '💕 Set couple dengan ropan busa super empuk! Perfect untuk date corner di cafe dengan nuansa romantic.',
        hashtags: '#setcouple #romantic #datespot #comfort #soft #cafe',
        category: 'set',
        priority: 2,
        baseTimestamp: Date.now() - (15 * 24 * 60 * 60 * 1000)
      },
      {
        id: '7',
        username: 'meja_cafe.plw',
        location: 'Palu, Sulawesi Tengah',
        image: 'assets2/meja/Meja taman.jpeg',
        avatar: 'assets2/logo/logo.jpg',
        likes: 178,
        caption: '🌿 Meja taman outdoor dengan design weather-resistant! Perfect untuk area outdoor cafe dengan nuansa natural.',
        hashtags: '#mejataman #outdoor #weatherproof #natural #garden',
        category: 'meja',
        priority: 2,
        baseTimestamp: Date.now() - (10 * 24 * 60 * 60 * 1000)
      },
      {
        id: '8',
        username: 'meja_cafe.plw',
        location: 'Palu, Sulawesi Tengah',
        image: 'assets2/set/set elinda.jpeg',
        avatar: 'assets2/logo/logo.jpg',
        likes: 234,
        caption: '✨ Set Elinda dengan design contemporary elegant! Kombinasi sofa dan meja yang sempurna untuk area VIP.',
        hashtags: '#setelinda #contemporary #elegant #vip #exclusive',
        category: 'set',
        priority: 1,
        baseTimestamp: Date.now() - (5 * 24 * 60 * 60 * 1000)
      },
      {
        id: '9',
        username: 'meja_cafe.plw',
        location: 'Palu, Sulawesi Tengah',
        image: 'assets2/meja/Meja konsol.jpeg',
        avatar: 'assets2/logo/logo.jpg',
        likes: 126,
        caption: '📺 Meja konsol multifungsi dengan storage yang maksimal! Cocok untuk display produk atau area kasir cafe.',
        hashtags: '#mejakonsol #storage #display #kasir #multifungsi',
        category: 'meja',
        priority: 3,
        baseTimestamp: Date.now() - (12 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  async loadInstagramPosts() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    console.log('Loading fresh Instagram posts...');

    try {
      this.showLoading();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate dynamic post selection
      this.posts = this.generateFreshPosts();
      
      this.renderCarousel();
      this.setupNavigation();
      this.startAutoplay();
      
    } catch (error) {
      console.error('Error loading Instagram posts:', error);
      this.showError();
    } finally {
      this.isLoading = false;
    }
  }

  generateFreshPosts() {
    // Shuffle dan pilih posts berdasarkan priority dan waktu
    const shuffledPosts = [...this.allPosts]
      .map(post => {
        // Update likes dengan variasi random
        const likesVariation = Math.floor(Math.random() * 20) - 10;
        const newLikes = Math.max(1, post.likes + likesVariation);
        
        // Update timestamp untuk variasi
        const timeVariation = Math.floor(Math.random() * 2 * 60 * 60 * 1000); // ±2 jam
        const newTimestamp = post.baseTimestamp + timeVariation;
        
        return {
          ...post,
          likes: newLikes,
          timestamp: newTimestamp,
          date: this.formatInstagramDate(newTimestamp)
        };
      })
      .sort((a, b) => {
        // Sort by priority first, then by timestamp (newest first)
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return b.timestamp - a.timestamp;
      });

    // Pilih posts dengan algoritma dynamic selection
    const selectedPosts = [];
    const categories = new Set();
    
    // Pastikan variasi kategori
    for (const post of shuffledPosts) {
      if (selectedPosts.length >= this.maxDisplayPosts) break;
      
      // Prioritaskan kategori yang belum ada
      if (!categories.has(post.category) || selectedPosts.length < 3) {
        selectedPosts.push(post);
        categories.add(post.category);
      }
    }
    
    // Isi sisa slot jika belum cukup
    for (const post of shuffledPosts) {
      if (selectedPosts.length >= this.maxDisplayPosts) break;
      if (!selectedPosts.find(p => p.id === post.id)) {
        selectedPosts.push(post);
      }
    }
    
    console.log(`✨ Generated ${selectedPosts.length} fresh posts with categories:`, 
                [...categories].join(', '));
    
    return selectedPosts.slice(0, this.maxDisplayPosts);
  }

  formatInstagramDate(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor(diff / (60 * 1000));
    
    if (days > 0) {
      if (days === 1) return '1 DAY AGO';
      if (days < 7) return `${days} DAYS AGO`;
      if (days < 14) return '1 WEEK AGO';
      return `${Math.floor(days/7)} WEEKS AGO`;
    } else if (hours > 0) {
      return `${hours}H AGO`;
    } else {
      return `${Math.max(1, minutes)}M AGO`;
    }
  }

  async refreshContent() {
    console.log('🔄 Auto-refreshing Instagram content...');
    
    // Show refresh indicator
    const refreshIndicator = document.getElementById('refresh-indicator');
    if (refreshIndicator) {
      refreshIndicator.style.display = 'inline-block';
    }
    
    // Show subtle loading on carousel
    const carousel = document.getElementById('instagram-carousel');
    if (carousel) {
      carousel.style.opacity = '0.7';
    }
    
    try {
      // Generate new post selection
      await new Promise(resolve => setTimeout(resolve, 1200));
      this.posts = this.generateFreshPosts();
      
      // Re-render with smooth transition
      this.renderCarousel();
      this.setupNavigation();
      
      // Reset carousel position
      this.currentIndex = 0;
      this.updateCarousel();
      
      if (carousel) {
        carousel.style.opacity = '1';
      }
      
      console.log('✨ Content refreshed successfully');
      
    } catch (error) {
      console.error('Error refreshing content:', error);
      if (carousel) {
        carousel.style.opacity = '1';
      }
    } finally {
      // Hide refresh indicator
      if (refreshIndicator) {
        setTimeout(() => {
          refreshIndicator.style.display = 'none';
        }, 500);
      }
    }
  }

  startAutoRefresh() {
    this.stopAutoRefresh();
    
    this.refreshInterval = setInterval(() => {
      if (!document.hidden && this.isInitialized()) {
        this.refreshContent();
      }
    }, this.refreshDelay);
    
    console.log(`🔄 Auto-refresh started: every ${this.refreshDelay/1000}s`);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  showLoading() {
    const loadingElement = document.querySelector('.carousel-loading');
    if (loadingElement) {
      loadingElement.style.display = 'flex';
    }
  }

  hideLoading() {
    const loadingElement = document.querySelector('.carousel-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  renderCarousel() {
    if (!this.carousel) return;

    this.hideLoading(); // Hide loading state first

    const postsHTML = this.posts.map(post => `
      <div class="instagram-post-card" data-post-id="${post.id}">
        <div class="instagram-post-header">
          <div class="instagram-avatar">
            <img src="${post.avatar}" alt="${post.username}" loading="lazy">
          </div>
          <div class="instagram-user-info">
            <div class="instagram-username">${post.username}</div>
            <div class="instagram-location">${post.location}</div>
          </div>
        </div>
        
        <div class="instagram-post-image-container">
          <img src="${post.image}" alt="Instagram post" class="instagram-post-image" loading="lazy">
        </div>
        
        <div class="instagram-post-content">
          <div class="instagram-actions">
            <div class="instagram-action-left">
              <i class="far fa-heart"></i>
              <i class="far fa-comment"></i>
              <i class="far fa-paper-plane"></i>
            </div>
            <div class="instagram-action-right">
              <i class="far fa-bookmark"></i>
            </div>
          </div>
          
          <div class="instagram-likes">${post.likes.toLocaleString('id-ID')} likes</div>
          
          <div class="instagram-caption">
            <span class="username">${post.username}</span>
            ${post.caption}
            <div class="instagram-hashtags">${post.hashtags}</div>
          </div>
          
          <div class="instagram-date">${post.date}</div>
        </div>
      </div>
    `).join('');

    this.carousel.innerHTML = postsHTML;
    this.updateCarouselWidth();
  }

  updateCarouselWidth() {
    const cardWidth = 320; // Including margin
    const totalWidth = this.posts.length * cardWidth;
    this.carousel.style.width = `${totalWidth}px`;
  }

  setupNavigation() {
    this.createDots();
    this.updateNavigationState();
  }

  createDots() {
    if (!this.dotsContainer) return;
    
    const totalSlides = Math.ceil(this.posts.length / this.postsPerView);
    const dotsHTML = Array.from({ length: totalSlides }, (_, i) => 
      `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></div>`
    ).join('');
    
    this.dotsContainer.innerHTML = dotsHTML;
  }

  setupEventListeners() {
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prevSlide());
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    }

    if (this.dotsContainer) {
      this.dotsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('carousel-dot')) {
          const slideIndex = parseInt(e.target.dataset.slide);
          this.goToSlide(slideIndex);
        }
      });
    }

    // Pause autoplay on hover
    if (this.carouselContainer) {
      this.carouselContainer.addEventListener('mouseenter', () => this.stopAutoplay());
      this.carouselContainer.addEventListener('mouseleave', () => this.startAutoplay());
    }

    // Handle visibility change for auto-refresh
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoplay();
        this.stopAutoRefresh();
      } else {
        this.startAutoplay();
        this.startAutoRefresh();
      }
    });
  }

  setupTouchEvents() {
    if (!this.carouselContainer) return;
    
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    this.carouselContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.stopAutoplay();
    });

    this.carouselContainer.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      e.preventDefault();
    });

    this.carouselContainer.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      const diffX = startX - currentX;
      const threshold = 50;

      if (diffX > threshold) {
        this.nextSlide();
      } else if (diffX < -threshold) {
        this.prevSlide();
      }

      isDragging = false;
      this.startAutoplay();
    });
  }

  nextSlide() {
    const maxIndex = Math.ceil(this.posts.length / this.postsPerView) - 1;
    this.currentIndex = this.currentIndex >= maxIndex ? 0 : this.currentIndex + 1;
    this.updateCarousel();
  }

  prevSlide() {
    const maxIndex = Math.ceil(this.posts.length / this.postsPerView) - 1;
    this.currentIndex = this.currentIndex <= 0 ? maxIndex : this.currentIndex - 1;
    this.updateCarousel();
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.updateCarousel();
  }

  updateCarousel() {
    if (!this.carousel) return;

    const cardWidth = 320;
    const translateX = -this.currentIndex * cardWidth * this.postsPerView;
    
    this.carousel.style.transform = `translateX(${translateX}px)`;
    this.updateNavigationState();
    this.updateDots();
  }

  updateNavigationState() {
    const maxIndex = Math.ceil(this.posts.length / this.postsPerView) - 1;
    
    if (this.prevButton) {
      this.prevButton.disabled = this.currentIndex === 0;
    }
    
    if (this.nextButton) {
      this.nextButton.disabled = this.currentIndex >= maxIndex;
    }
  }

  updateDots() {
    if (!this.dotsContainer) return;
    
    const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  showError() {
    if (this.carousel) {
      this.carousel.innerHTML = `
        <div class="carousel-loading">
          <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 2rem; margin-bottom: 1rem;"></i>
          <p>Unable to load Instagram posts at the moment.</p>
          <a href="https://www.instagram.com/meja_cafe.plw" target="_blank" class="instagram-follow-btn" style="margin-top: 1rem;">
            <i class="fab fa-instagram"></i>
            <span>Visit Our Instagram</span>
          </a>
        </div>
      `;
    }
  }

  // Handle responsive changes
  handleResize() {
    const width = window.innerWidth;
    if (width <= 600) {
      this.postsPerView = 1;
    } else if (width <= 768) {
      this.postsPerView = 2;
    } else {
      this.postsPerView = 3;
    }
    this.updateCarouselWidth();
    this.updateCarousel();
    this.createDots();
  }

  destroy() {
    this.stopAutoplay();
    this.stopAutoRefresh();
    // Clean up event listeners if needed
  }
}

// ============================================
// APPLICATION BOOTSTRAP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();

  // Register all modules
  app.register(new AnimationController());
  app.register(new ProductFilter());
  app.register(new ShoppingCart());
  app.register(new ImageZoom());
  app.register(new FAQAccordion());
  app.register(new SmoothScrollController());
  app.register(new InstagramCarousel());

  // Initialize application
  app.init();

  // Make app globally accessible for debugging
  window.MejaCafePalu = app;
});
