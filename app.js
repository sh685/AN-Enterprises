// Global variables
let cart = JSON.parse(localStorage.getItem('anEnterprises_cart')) || [];
let currentProduct = null;
let filteredProducts = [...products];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateCartUI();
    loadPageContent();
    initializeAnimations();
    
    // Initialize navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
}

function setupEventListeners() {
    // Navigation
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Cart functionality
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');

    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCart);
    }
    
    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    // Modal functionality
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Quantity controls in modal
    const qtyMinus = document.querySelector('.qty-btn.minus');
    const qtyPlus = document.querySelector('.qty-btn.plus');
    const qtyInput = document.getElementById('modal-quantity');

    if (qtyMinus) {
        qtyMinus.addEventListener('click', () => {
            const current = parseInt(qtyInput.value);
            if (current > 1) {
                qtyInput.value = current - 1;
            }
        });
    }

    if (qtyPlus) {
        qtyPlus.addEventListener('click', () => {
            const current = parseInt(qtyInput.value);
            qtyInput.value = current + 1;
        });
    }

    // Add to cart from modal
    const addToCartModal = document.getElementById('add-to-cart-modal');
    if (addToCartModal) {
        addToCartModal.addEventListener('click', () => {
            if (currentProduct) {
                const quantity = parseInt(qtyInput.value);
                addToCart(currentProduct, quantity);
                closeModal();
            }
        });
    }

    // Checkout functionality
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', openCheckout);
    }

    // Checkout modal
    const checkoutModalClose = document.getElementById('checkout-modal-close');
    const checkoutModalOverlay = document.getElementById('checkout-modal-overlay');
    
    if (checkoutModalClose) {
        checkoutModalClose.addEventListener('click', closeCheckout);
    }
    
    if (checkoutModalOverlay) {
        checkoutModalOverlay.addEventListener('click', (e) => {
            if (e.target === checkoutModalOverlay) {
                closeCheckout();
            }
        });
    }

    // Place order
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }

    // Filters (on kitchen and decor pages)
    const sortSelect = document.getElementById('sort-select');
    const priceFilter = document.getElementById('price-filter');
    const categoryFilter = document.getElementById('category-filter');

    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

function loadPageContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'index.html':
        case '':
            loadHomePage();
            break;
        case 'kitchen.html':
            loadKitchenPage();
            break;
        case 'decor.html':
            loadDecorPage();
            break;
    }
}

function loadHomePage() {
    const featuredGrid = document.getElementById('featured-products-grid');
    if (featuredGrid) {
        const featuredProducts = products.filter(product => product.featured).slice(0, 8);
        renderProducts(featuredProducts, featuredGrid);
    }
}

function loadKitchenPage() {
    const kitchenGrid = document.getElementById('kitchen-products-grid');
    if (kitchenGrid) {
        filteredProducts = products.filter(product => product.category === 'kitchen');
        renderProducts(filteredProducts, kitchenGrid);
    }
}

function loadDecorPage() {
    const decorGrid = document.getElementById('decor-products-grid');
    if (decorGrid) {
        filteredProducts = products.filter(product => product.category === 'decor');
        renderProducts(filteredProducts, decorGrid);
    }
}

function renderProducts(productList, container) {
    if (!container) return;
    
    container.innerHTML = '';
    
    productList.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
    
    // Add animation to new cards
    requestAnimationFrame(() => {
        container.querySelectorAll('.product-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-overlay">
                <button class="overlay-btn quick-view" onclick="openProductModal(${product.id})">Quick View</button>
                <button class="overlay-btn add-to-cart-quick" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">₹${product.price.toLocaleString()}</div>
            <div class="gst-info">+ GST (18%)</div>
            ${product.rating ? `
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</span>
                    <span class="rating-text">(${product.reviews} reviews)</span>
                </div>
            ` : ''}
            <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `;
    
    return card;
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    
    const modal = document.getElementById('modal-overlay');
    const productImage = document.getElementById('modal-product-image');
    const productName = document.getElementById('modal-product-name');
    const productPrice = document.getElementById('modal-product-price');
    const productDescription = document.getElementById('modal-product-description');
    const quantityInput = document.getElementById('modal-quantity');
    
    if (productImage) productImage.src = product.image;
    if (productName) productName.textContent = product.name;
    if (productPrice) productPrice.textContent = product.price.toLocaleString();
    if (productDescription) productDescription.textContent = product.description;
    if (quantityInput) quantityInput.value = 1;
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    currentProduct = null;
}

function addToCart(productId, quantity = 1) {
    const product = typeof productId === 'object' ? productId : products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    updateCartStorage();
    updateCartUI();
    showCartAnimation();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartStorage();
    updateCartUI();
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartStorage();
            updateCartUI();
        }
    }
}

function updateCartStorage() {
    localStorage.setItem('anEnterprises_cart', JSON.stringify(cart));
}

function updateCartUI() {
    updateCartCount();
    updateCartItems();
    updateCartTotal();
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        if (totalItems > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    }
}

function updateCartItems() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" 
                           onchange="updateCartQuantity(${item.id}, this.value)">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">&times;</button>
        `;
        cartItems.appendChild(cartItem);
    });
}

function updateCartTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    
    const subtotalElement = document.getElementById('cart-subtotal');
    const gstElement = document.getElementById('cart-gst');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement) subtotalElement.textContent = subtotal.toLocaleString();
    if (gstElement) gstElement.textContent = Math.round(gst).toLocaleString();
    if (totalElement) totalElement.textContent = Math.round(total).toLocaleString();
    
    // Update checkout totals if checkout modal is open
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutGst = document.getElementById('checkout-gst');
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (checkoutSubtotal) checkoutSubtotal.textContent = subtotal.toLocaleString();
    if (checkoutGst) checkoutGst.textContent = Math.round(gst).toLocaleString();
    if (checkoutTotal) checkoutTotal.textContent = Math.round(total).toLocaleString();
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartSidebar && cartOverlay) {
        const isOpen = cartSidebar.classList.contains('open');
        
        if (isOpen) {
            closeCart();
        } else {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function openCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const checkoutModal = document.getElementById('checkout-modal-overlay');
    const checkoutItems = document.getElementById('checkout-items');
    
    if (checkoutItems) {
        checkoutItems.innerHTML = '';
        cart.forEach(item => {
            const checkoutItem = document.createElement('div');
            checkoutItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>₹${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `;
            checkoutItems.appendChild(checkoutItem);
        });
    }
    
    updateCartTotal();
    closeCart();
    
    if (checkoutModal) {
        checkoutModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkout-modal-overlay');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function placeOrder() {
    const form = document.getElementById('checkout-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Generate invoice
    generateInvoice();
    
    // Clear cart
    cart = [];
    updateCartStorage();
    updateCartUI();
    
    // Close checkout
    closeCheckout();
    
    // Show success message
    alert('Order placed successfully! Your invoice has been generated.');
}

function generateInvoice() {
    const formData = new FormData(document.getElementById('checkout-form'));
    const customerInfo = Object.fromEntries(formData.entries());
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    
    const invoiceNumber = 'ANE' + Date.now();
    const invoiceDate = new Date().toLocaleDateString();
    
    const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${invoiceNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .company-logo { width: 60px; height: 60px; margin-bottom: 10px; }
                .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .customer-details, .company-details { width: 48%; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; }
                .totals { text-align: right; margin-top: 20px; }
                .total-row { font-weight: bold; font-size: 18px; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>AN ENTERPRISES</h1>
                <p>Premium Home, Kitchen & Décor</p>
                <p>123 Business District, Mumbai, Maharashtra 400001</p>
                <p>Phone: +91 98765 43210 | Email: info@anenterprises.com</p>
                <p>GSTIN: 27AAAAA0000A1Z5</p>
            </div>
            
            <div class="invoice-details">
                <div class="company-details">
                    <h3>From:</h3>
                    <p><strong>AN Enterprises</strong><br>
                    123 Business District<br>
                    Mumbai, Maharashtra 400001<br>
                    Phone: +91 98765 43210</p>
                </div>
                <div class="customer-details">
                    <h3>To:</h3>
                    <p><strong>${customerInfo.name || 'Customer'}</strong><br>
                    ${customerInfo.address || 'Address'}<br>
                    ${customerInfo.city || 'City'}, ${customerInfo.pincode || 'PIN'}<br>
                    Phone: ${customerInfo.phone || 'Phone'}<br>
                    Email: ${customerInfo.email || 'Email'}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Date:</strong> ${invoiceDate}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Rate (₹)</th>
                        <th>Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price.toLocaleString()}</td>
                            <td>${(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <p>Subtotal: ₹${subtotal.toLocaleString()}</p>
                <p>GST (18%): ₹${Math.round(gst).toLocaleString()}</p>
                <p class="total-row">Total: ₹${Math.round(total).toLocaleString()}</p>
            </div>
            
            <div style="margin-top: 40px;">
                <p><strong>Terms & Conditions:</strong></p>
                <ul>
                    <li>Payment is due within 30 days of invoice date.</li>
                    <li>Returns accepted within 30 days with original packaging.</li>
                    <li>Warranty terms apply as per product specifications.</li>
                </ul>
            </div>
            
            <div class="no-print" style="margin-top: 20px; text-align: center;">
                <button onclick="window.print()">Print Invoice</button>
                <button onclick="window.close()">Close</button>
            </div>
        </body>
        </html>
    `;
    
    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
}

function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    let baseProducts = [];
    
    if (currentPage === 'kitchen.html') {
        baseProducts = products.filter(p => p.category === 'kitchen');
    } else if (currentPage === 'decor.html') {
        baseProducts = products.filter(p => p.category === 'decor');
    } else {
        baseProducts = products;
    }
    
    const filtered = baseProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm))
    );
    
    // Update the appropriate grid
    const grids = {
        'index.html': 'featured-products-grid',
        'kitchen.html': 'kitchen-products-grid', 
        'decor.html': 'decor-products-grid'
    };
    
    const gridId = grids[currentPage] || 'featured-products-grid';
    const grid = document.getElementById(gridId);
    
    if (grid) {
        renderProducts(filtered, grid);
    }
}

function applyFilters() {
    const sortValue = document.getElementById('sort-select')?.value;
    const priceValue = document.getElementById('price-filter')?.value;
    const categoryValue = document.getElementById('category-filter')?.value;
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    let filtered = [...filteredProducts];
    
    // Apply category filter (for decor page)
    if (categoryValue && categoryValue !== 'all') {
        filtered = filtered.filter(p => p.subcategory === categoryValue);
    }
    
    // Apply price filter
    if (priceValue && priceValue !== 'all') {
        const [min, max] = priceValue.split('-').map(Number);
        if (max) {
            filtered = filtered.filter(p => p.price >= min && p.price <= max);
        } else {
            filtered = filtered.filter(p => p.price >= min);
        }
    }
    
    // Apply sorting
    if (sortValue) {
        switch (sortValue) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'popularity':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'name':
            default:
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
    }
    
    // Render filtered products
    const grids = {
        'kitchen.html': 'kitchen-products-grid',
        'decor.html': 'decor-products-grid'
    };
    
    const gridId = grids[currentPage];
    const grid = document.getElementById(gridId);
    
    if (grid) {
        renderProducts(filtered, grid);
    }
}

function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const formObject = Object.fromEntries(formData.entries());
    
    // Simulate form submission
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.background = '#28a745';
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you for your message! We\'ll get back to you soon.';
        
        e.target.insertBefore(successMessage, e.target.firstChild);
        
        // Reset form
        e.target.reset();
        
        // Reset button after 3 seconds
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
            successMessage.remove();
        }, 3000);
    }, 1500);
}

function showCartAnimation() {
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartBtn.style.transform = '';
        }, 200);
    }
}

function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .category-card, .value-card, .team-member, .faq-item').forEach(el => {
        observer.observe(el);
    });
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(price);
}

function debounce(func, wait) {
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

// Export functions for global access
window.openProductModal = openProductModal;
window.closeModal = closeModal;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleCart = toggleCart;
window.closeCart = closeCart;
