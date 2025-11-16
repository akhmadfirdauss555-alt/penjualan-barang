# 🪑 MEJA CAFE PALU - Developer Documentation

## 📁 Project Structure

```
penjualan-barang/
├── index.html           # Main HTML file
├── style.css            # All styling (organized by sections)
├── script.js            # Modular JavaScript (refactored)
├── script-old.js        # Backup of old code
├── kata-kata-web.md     # Business contact info
├── README.md            # Public documentation
├── DEVELOPER.md         # This file
├── assets/              # Old template images
├── assets2/             # Current furniture product images
└── font(Shabnam)/       # Custom fonts
```

---

## 🔧 JavaScript Architecture

### Modular Structure

The JavaScript is organized into **9 main modules** for easy maintenance:

#### 1. **CONFIG** - Configuration Constants
```javascript
const CONFIG = {
  SCROLL_THRESHOLD: 8,
  ANIMATION_THRESHOLD: 0.1,
  WHATSAPP_NUMBER: '6285220888840'
};
```

#### 2. **Utils** - Utility Functions
- `formatMoney()` - Format numbers to Indonesian Rupiah
- `debounce()` - Debounce function calls for performance

#### 3. **AnimationModule** - Scroll & UI Animations
- Scroll-based animations (IntersectionObserver)
- Smooth scroll for anchor links
- Sticky navigation on scroll

#### 4. **FilterModule** - Product Filtering
- Category filters (Semua, Meja, Sofa, Set)
- Dynamic product display

#### 5. **CartModule** - Shopping Cart
- Add/remove items
- Update quantities
- Generate WhatsApp order message
- Persistent cart state

#### 6. **ImageZoomModule** - Product Image Zoom
- Click to zoom modal
- ESC/click-outside to close
- Prevent body scroll when modal open

#### 7. **FAQModule** - FAQ Accordion
- Toggle FAQ items
- Rotate chevron icon animation

#### 8. **SmoothScrollModule** - Lenis Integration
- Smooth scroll library initialization

#### 9. **Main Initialization**
- Initialize all modules on DOMContentLoaded
- Error handling and logging

---

## 🎨 CSS Organization

### Structure by Sections:

1. **Variables & Base** - CSS custom properties, resets
2. **Hero Section** - Header and hero banner
3. **Navigation** - Navbar styling and sticky behavior
4. **Menu Section** - Product catalog grid
5. **Cart** - Shopping cart dropdown
6. **Footer** - Footer and contact info
7. **FAQ** - FAQ accordion styling
8. **Floating WhatsApp** - Animated WhatsApp button
9. **Image Zoom Modal** - Product image zoom overlay
10. **Responsive** - Media queries for mobile

---

## 🔄 How to Modify

### Adding a New Product

1. **Add image to `assets2/` folder**
2. **Edit `index.html`** - Add new menu-item:
```html
<div class="menu-item animate-on-scroll" data-category="meja">
    <img src="assets2/your-image.jpeg" alt="Product Name" class="menu-item-img">
    <div class="menu-item-content">
        <h3>Product Name</h3>
        <p>Product description here.</p>
        <div class="menu-item-footer">
            <span class="price">Hubungi Kami</span>
            <button class="add-to-cart-btn">+</button>
        </div>
    </div>
</div>
```

### Changing WhatsApp Number

**Edit `script.js`:**
```javascript
const CONFIG = {
  WHATSAPP_NUMBER: 'YOUR_NUMBER_HERE' // Format: 6285220888840
};
```

**Edit `index.html`** (2 places):
1. Hero section button
2. Floating WhatsApp button
3. Footer contact section

### Adding New Category

1. **Add filter button** in `index.html`:
```html
<button class="filter-btn" data-filter="new-category">New Category</button>
```

2. **Add products** with matching `data-category="new-category"`

3. **No JavaScript change needed!** FilterModule handles it automatically.

### Modifying Colors

**Edit `style.css` - CSS Variables:**
```css
:root {
  --primary-color: #f5f5dc;    /* Main text color */
  --secondary-color: #6f4e37;  /* Brown accent */
  --accent-color: #c8a064;     /* Gold accent */
  --text-color: #333;          /* Body text */
  --bg-color: #fff;            /* Background */
}
```

---

## 🐛 Debugging

### Console Logs

The script logs initialization status:
```
🪑 MEJA CAFE PALU - Initializing...
✅ All modules initialized successfully
```

If you see errors:
```
❌ Initialization error: [error details]
```

### Common Issues

**1. Cart not working?**
- Check if `cart-toggle` ID exists in HTML
- Verify `.cart-dropdown` class exists

**2. Filters not working?**
- Check `data-filter` on buttons matches `data-category` on products
- Verify FilterModule initialized in console

**3. Image zoom not working?**
- Check if `image-modal` ID exists
- Verify `.menu-item-img` class on product images

**4. WhatsApp not opening?**
- Check CONFIG.WHATSAPP_NUMBER format (no spaces, no +)
- Should be: `6285220888840` not `+62 852-2088-8840`

---

## 📱 Responsive Breakpoints

```css
/* Mobile First - Base styles for mobile */

@media (max-width: 768px) {
  /* Tablet adjustments */
}

@media (max-width: 480px) {
  /* Small mobile adjustments */
}
```

---

## 🔐 Security Notes

1. **No sensitive data in frontend** - All pricing discussions via WhatsApp
2. **No API keys** - Static site, no backend
3. **XSS Prevention** - Using `textContent` instead of `innerHTML` where possible

---

## 🚀 Deployment

### GitHub Pages
1. Push to `main` branch
2. Enable GitHub Pages in repo settings
3. Select `main` branch as source
4. Done! Site available at `https://dlanang.github.io/penjualan-barang/`

### Custom Domain
1. Add `CNAME` file with your domain
2. Configure DNS A records to GitHub IPs
3. Enable HTTPS in GitHub Pages settings

---

## 📝 Code Style Guidelines

### JavaScript
- Use **const** for variables that don't change
- Use **camelCase** for variable names
- Add **comments** for complex logic
- Keep functions **small and focused**
- Use **optional chaining** (`?.`) for safety

### CSS
- Use **CSS custom properties** for colors/fonts
- **Mobile-first** approach
- Use **BEM-like** naming when possible
- **Group related styles** with comments

### HTML
- Use **semantic HTML5** tags
- Include **ARIA labels** for accessibility
- Use **data attributes** for JS targeting
- Keep **indentation consistent** (2 spaces)

---

## 🧪 Testing Checklist

Before deploying changes:

- [ ] Test all filter categories
- [ ] Add/remove items from cart
- [ ] Test cart quantity controls
- [ ] Click images to test zoom modal
- [ ] Close modal with X, ESC, and click-outside
- [ ] Click floating WhatsApp button
- [ ] Test checkout → WhatsApp message format
- [ ] Test FAQ accordion open/close
- [ ] Test on mobile device (responsive)
- [ ] Check console for errors

---

## 🆘 Support

For issues or questions:
- Check browser console for errors
- Review this documentation
- Check `script-old.js` for reference
- Contact: [Your contact info here]

---

## 📚 Dependencies

- **Font Awesome 5.10.0** - Icons
- **Lenis 1.3.11** - Smooth scroll library
- **Google Fonts** - Playfair Display & Lora

---

## 🔄 Version History

### v2.0 (Current) - Refactored & Modular
- Modular JavaScript architecture
- Improved code organization
- Better error handling
- Comprehensive documentation

### v1.0 - Initial Version
- Basic functionality
- Coffee shop template adapted
- Single script file

---

**Last Updated:** November 16, 2025
**Maintained by:** Development Team
