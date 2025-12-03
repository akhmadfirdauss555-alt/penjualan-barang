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
      checkoutBtn: Utils.safeQuerySelector('.cart-checkout'),
      cartNav: document.getElementById('cart-toggle')
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

    // Add to cart buttons (ANIMASI + TAMBAH KE KERANJANG)
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.animateAddToCart(button);   // animasi terbang
        this.addItemFromButton(button);  // logic keranjang
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
    const isInsideCart =
      this.elements.toggle?.contains(event.target) ||
      this.elements.dropdown?.contains(event.target);

    if (!isInsideCart) {
      this.elements.toggle?.setAttribute('aria-expanded', 'false');
      this.elements.dropdown?.classList.remove('open');
    }
  }

  // Ambil data produk dari kartu dan masukkan ke keranjang
  addItemFromButton(button) {
    const productElement = button.closest('.menu-item');
    if (!productElement) return;

    const product = this.extractProductData(productElement);
    this.addItem(product);
  }

  // Animasi gambar terbang ke icon cart
  animateAddToCart(button) {
    const cartNav = this.elements.cartNav;
    if (!cartNav) return;

    const productElement = button.closest('.menu-item');
    if (!productElement) return;

    const img = productElement.querySelector('.menu-item-img');
    if (!img) return;

    const imgRect  = img.getBoundingClientRect();
    const cartRect = cartNav.getBoundingClientRect();

    const flying = img.cloneNode(true);
    flying.classList.add('flying-img');
    flying.style.left   = imgRect.left + 'px';
    flying.style.top    = imgRect.top + 'px';
    flying.style.width  = imgRect.width + 'px';
    flying.style.height = imgRect.height + 'px';
    flying.style.opacity = '1';
    flying.style.transform = 'scale(1.05)';

    document.body.appendChild(flying);

    const deltaX = cartRect.left + cartRect.width / 2  - (imgRect.left + imgRect.width / 2);
    const deltaY = cartRect.top  + cartRect.height / 2 - (imgRect.top  + imgRect.height / 2);

    requestAnimationFrame(() => {
      flying.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3)`;
      flying.style.opacity = '0';
    });

    flying.addEventListener('transitionend', () => {
      flying.remove();
      cartNav.classList.add('bump');
      setTimeout(() => cartNav.classList.remove('bump'), 400);
    }, { once: true });
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

  // == FORM PEMESANAN ==
  checkout() {
    if (this.isEmpty()) {
      alert('Keranjang masih kosong!');
      return;
    }

    // Siapkan data keranjang
    const cartItems = this.items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const totalAmount = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // SIMPAN KE LOCALSTORAGE supaya bisa dibaca di order.html
    const payload = { cart: cartItems, total: totalAmount };
    localStorage.setItem('MEJA_CAFE_CART', JSON.stringify(payload));

    // PINDAH KE HALAMAN FORM PEMESANAN
    // pakai relative path supaya aman di GitHub Pages / Vercel
    window.location.href = 'order.html';
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

    const totalAmount = this.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    this.elements.total.textContent = Utils.formatCurrency(totalAmount);
  }

  updateEmptyState() {
    if (!this.elements.empty) return;

    this.elements.empty.style.display = this.isEmpty() ? 'block' : 'none';
  }
}
