// Kitchen Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeKitchenPage();
});

function initializeKitchenPage() {
    setupKitchenEventListeners();
    renderKitchenProducts();
    updateCartUI();
    updateWishlistUI();
    setupScrollEffects();
}

function setupKitchenEventListeners() {
    // Cart and wishlist buttons
    const cartBtn = document.getElementById('cart-btn');
    const wishlistBtn = document.getElementById('wishlist-btn');
    const cartClose = document.getElementById('cart-close');
    const wishlistClose = document.getElementById('wishlist-close');

    cartBtn?.addEventListener('click', toggleCart);
    wishlistBtn?.addEventListener('click', toggleWishlist);
    cartClose?.addEventListener('click', toggleCart);
    wishlistClose?.addEventListener('click', toggleWishlist);

    // Subcategory items
    const subcategoryItems = document.querySelectorAll('.subcategory__item');
    subcategoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const filter = item.dataset.filter;
            filterKitchenProducts(filter);
        });
    });

    // Filter and sort
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');

    categoryFilter?.addEventListener('change', handleFilterChange);
    sortSelect?.addEventListener('change', handleSortChange);

    // Search functionality
    const searchInputs = document.querySelectorAll('.search__input');
    searchInputs.forEach(input => {
        input.addEventListener('input', handleSearch);
    });
}

function renderKitchenProducts(productsToRender = null) {
    const kitchenProducts = productsToRender || products.filter(product => product.category === 'kitchen');
    const productsGrid = document.getElementById('products-grid');
    const productsCount = document.getElementById('products-count');
    
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    if (productsCount) {
        productsCount.textContent = `${kitchenProducts.length} Items`;
    }
    
    kitchenProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function filterKitchenProducts(filter) {
    const kitchenProducts = products.filter(product => product.category === 'kitchen');
    
    let filteredProducts;
    if (filter === 'all') {
        filteredProducts = kitchenProducts;
    } else {
        filteredProducts = kitchenProducts.filter(product => product.subcategory === filter);
    }
    
    renderKitchenProducts(filteredProducts);
}

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product__card';
    
    const totalPrice = product.price + (product.price * product.gst / 100);
    const isInWishlist = getWishlist().some(item => item.id === product.id);
    
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

function handleFilterChange() {
    const categoryFilter = document.getElementById('category-filter');
    const selectedCategory = categoryFilter?.value;
    
    if (selectedCategory) {
        filterKitchenProducts(selectedCategory);
    }
}

function handleSortChange(e) {
    const sortValue = e.target.value;
    const kitchenProducts = products.filter(product => product.category === 'kitchen');
    let sortedProducts = [...kitchenProducts];
    
    switch (sortValue) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sortedProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            sortedProducts.sort((a, b) => b.id - a.id);
            break;
        default:
            // Keep original order for recommended
            break;
    }
    
    renderKitchenProducts(sortedProducts);
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const kitchenProducts = products.filter(product => product.category === 'kitchen');
    
    if (query.length === 0) {
        renderKitchenProducts();
        return;
    }
    
    const filteredProducts = kitchenProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.subcategory.toLowerCase().includes(query)
    );
    
    renderKitchenProducts(filteredProducts);
}

// Cart functions
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar?.classList.toggle('open');
}

function toggleWishlist() {
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    wishlistSidebar?.classList.toggle('open');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
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
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartQuantity(productId, quantity) {
    let cart = getCart();
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

function toggleWishlistItem(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let wishlist = getWishlist();
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
    renderKitchenProducts(); // Re-render to update heart icons
}

function updateCartUI() {
    const cart = getCart();
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

function updateWishlistUI() {
    const wishlist = getWishlist();
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
    const elementsToAnimate = document.querySelectorAll('.section__title, .subcategory__item, .fade-in');
    elementsToAnimate.forEach(el => observer.observe(el));
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #333;
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(51, 51, 51, 0.3);
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
