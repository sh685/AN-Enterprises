// Main JavaScript for Myntra-style Website
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Global State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let currentFilter = 'all';
let currentSort = 'recommended';
let currentSlide = 0;

function initializeApp() {
    setupEventListeners();
    renderProducts();
    updateCartUI();
    updateWishlistUI();
    startHeroSlider();
    startCountdown();
    setupScrollEffects();
}

function setupEventListeners() {
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    mobileToggle?.addEventListener('click', toggleMobileMenu);

    // Cart and wishlist buttons
    const cartBtn = document.getElementById('cart-btn');
    const wishlistBtn = document.getElementById('wishlist-btn');
    const cartClose = document.getElementById('cart-close');
    const wishlistClose = document.getElementById('wishlist-close');

    cartBtn?.addEventListener('click', toggleCart);
    wishlistBtn?.addEventListener('click', toggleWishlist);
    cartClose?.addEventListener('click', toggleCart);
    wishlistClose?.addEventListener('click', toggleWishlist);

    // Category items
    const categoryItems = document.querySelectorAll('.category__item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            filterProducts(category);
        });
    });

    // Filter and sort
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortSelect = document.getElementById('sort-select');

    categoryFilter?.addEventListener('change', handleFilterChange);
    priceFilter?.addEventListener('change', handleFilterChange);
    sortSelect?.addEventListener('change', handleSortChange);

    // Hero slider dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Search functionality
    const searchInputs = document.querySelectorAll('.search__input');
    searchInputs.forEach(input => {
        input.addEventListener('input', handleSearch);
    });
}

// Hero Slider
function startHeroSlider() {
    const slides = document.querySelectorAll('.hero__slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;

    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    }, 5000);
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

function updateSlider() {
    const slides = document.querySelectorAll('.hero__slide');
    const dots = document.querySelectorAll('.dot');

    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Countdown Timer
function startCountdown() {
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!hoursEl || !minutesEl || !secondsEl) return;

    let hours = 12;
    let minutes = 34;
    let seconds = 56;

    setInterval(() => {
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            if (minutes < 0) {
                minutes = 59;
                hours--;
                if (hours < 0) {
                    hours = 23;
                }
            }
        }

        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Product Rendering
function renderProducts(productsToRender = products) {
    const productsGrid = document.getElementById('products-grid');
    const productsCount = document.getElementById('products-count');
    
    if (!productsGrid) return;

    productsGrid.innerHTML = '';
    
    if (productsCount) {
        productsCount.textContent = `${productsToRender.length} Items`;
    }

    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product__card';
    
    const totalPrice = product.price + (product.price * product.gst / 100);
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    div.innerHTML = `
        <div class="product__image">
            <img src="${product.image}" alt="${product.name}">
            <button class="wishlist__btn ${isInWishlist ? 'active' : ''}" onclick="toggleWishlistItem(${product.id})">
                <i class="fa${isInWishlist ? 's' : 'r'} fa-heart"></i>
            </button>
            ${product.badge ? `<div class="product__badge">${product.badge}</div>` : ''}
        </div>
        <div class="product__content">
            <div class="product__brand">${product.brand}</div>
            <div class="product__name">${product.name}</div>
            <div class="product__rating">
                <div class="rating__badge">
                    ${product.rating} <i class="fas fa-star"></i>
                </div>
                <span class="rating__count">(${product.reviewCount})</span>
            </div>
            <div class="product__price">
                <span class="price__current">₹${product.price}</span>
                ${product.originalPrice ? `<span class="price__original">₹${product.originalPrice}</span>` : ''}
                ${product.discount ? `<span class="price__discount">(${product.discount}% OFF)</span>` : ''}
            </div>
            <button class="add__to__bag" onclick="addToCart(${product.id})">ADD TO BAG</button>
        </div>
    `;
    
    return div;
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification('Added to bag!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    
    // Update cart items
    if (cartItems) {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: #94969f;">Your bag is empty</div>';
        } else {
            cart.forEach(item => {
                const cartItem = createCartItemElement(item);
                cartItems.appendChild(cartItem);
            });
        }
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = total.toFixed(0);
}

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart__item';
    
    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="item__info">
            <div class="item__brand">${item.brand}</div>
            <div class="item__name">${item.name}</div>
            <div class="item__price">₹${item.price}</div>
            <div class="item__controls">
                <button class="qty__btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span class="qty__value">${item.quantity}</span>
                <button class="qty__btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                <button class="remove__btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `;
    
    return div;
}

// Wishlist Functions
function toggleWishlistItem(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = wishlist.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification('Removed from wishlist');
    } else {
        wishlist.push(product);
        showNotification('Added to wishlist');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
    renderProducts(); // Re-render to update heart icons
}

function updateWishlistUI() {
    const wishlistCount = document.getElementById('wishlist-count');
    const wishlistItems = document.getElementById('wishlist-items');
    
    // Update wishlist count
    if (wishlistCount) wishlistCount.textContent = wishlist.length;
    
    // Update wishlist items
    if (wishlistItems) {
        wishlistItems.innerHTML = '';
        
        if (wishlist.length === 0) {
            wishlistItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: #94969f;">Your wishlist is empty</div>';
        } else {
            wishlist.forEach(item => {
                const wishlistItem = createWishlistItemElement(item);
                wishlistItems.appendChild(wishlistItem);
            });
        }
    }
}

function createWishlistItemElement(item) {
    const div = document.createElement('div');
    div.className = 'wishlist__item';
    
    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="item__info">
            <div class="item__brand">${item.brand}</div>
            <div class="item__name">${item.name}</div>
            <div class="item__price">₹${item.price}</div>
            <div class="item__controls">
                <button class="btn btn--primary" onclick="addToCart(${item.id})" style="padding: 0.5rem 1rem; font-size: 0.8rem; margin-right: 0.5rem;">ADD TO BAG</button>
                <button class="remove__btn" onclick="toggleWishlistItem(${item.id})">Remove</button>
            </div>
        </div>
    `;
    
    return div;
}

// Filter and Sort Functions
function filterProducts(category) {
    currentFilter = category;
    applyFiltersAndSort();
}

function handleFilterChange() {
    applyFiltersAndSort();
}

function handleSortChange(e) {
    currentSort = e.target.value;
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    let filteredProducts = [...products];
    
    // Apply category filter
    const categoryFilter = document.getElementById('category-filter');
    const selectedCategory = categoryFilter?.value || currentFilter;
    
    if (selectedCategory && selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === selectedCategory
        );
    }
    
    // Apply price filter
    const priceFilter = document.getElementById('price-filter');
    const selectedPrice = priceFilter?.value;
    
    if (selectedPrice && selectedPrice !== 'all') {
        const [min, max] = selectedPrice.split('-').map(p => p.replace('+', ''));
        filteredProducts = filteredProducts.filter(product => {
            if (max) {
                return product.price >= parseInt(min) && product.price <= parseInt(max);
            } else {
                return product.price >= parseInt(min);
            }
        });
    }
    
    // Apply sorting
    const sortSelect = document.getElementById('sort-select');
    const selectedSort = sortSelect?.value || currentSort;
    
    switch (selectedSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            filteredProducts.sort((a, b) => b.id - a.id);
            break;
        default:
            // Keep original order for recommended
            break;
    }
    
    renderProducts(filteredProducts);
}

// Search Function
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (query.length === 0) {
        renderProducts();
        return;
    }
    
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
    
    renderProducts(filteredProducts);
}

// UI Functions
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar?.classList.toggle('open');
}

function toggleWishlist() {
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    wishlistSidebar?.classList.toggle('open');
}

function toggleMobileMenu() {
    // Mobile menu functionality can be added here
    console.log('Mobile menu toggle');
}

function setupScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll('.fade-in, .section__title, .category__item, .deal__item');
    elementsToAnimate.forEach(el => observer.observe(el));
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #ff3f6c;
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(255, 63, 108, 0.3);
        z-index: 3000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        font-size: 0.9rem;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleWishlistItem = toggleWishlistItem;