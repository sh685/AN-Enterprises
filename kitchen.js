// Kitchen Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeKitchenPage();
});

function initializeKitchenPage() {
    setupKitchenEventListeners();
    renderKitchenProducts();
    updateCartUI();
    setupAnimations();
    setupScrollEffects();
}

function setupKitchenEventListeners() {
    // Navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');
    const filterBtns = document.querySelectorAll('.filter__btn');
    const cartClose = document.getElementById('cart-close');
    const subcategoryItems = document.querySelectorAll('.subcategory__item');

    navToggle?.addEventListener('click', toggleNav);
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('cart-link')) {
                e.preventDefault();
                toggleCart();
            }
        });
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            setActiveFilter(btn);
            filterKitchenProducts(filter);
        });
    });

    // Subcategory items
    subcategoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const filter = item.dataset.filter;
            const filterBtn = document.querySelector(`[data-filter="${filter}"]`);
            if (filterBtn) {
                setActiveFilter(filterBtn);
                filterKitchenProducts(filter);
            }
        });
    });

    // Cart close
    cartClose?.addEventListener('click', toggleCart);
    
    // Scroll effects
    window.addEventListener('scroll', handleScroll);
}

function renderKitchenProducts(productsToRender = null) {
    const kitchenProducts = productsToRender || products.filter(product => product.category === 'kitchen');
    const productsGrid = document.getElementById('kitchen-products-grid');
    
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    kitchenProducts.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsGrid.appendChild(productCard);
    });
    
    // Trigger animations
    setTimeout(() => {
        const cards = productsGrid.querySelectorAll('.product__card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate');
            }, index * 100);
        });
    }, 100);
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

function createProductCard(product, index) {
    const div = document.createElement('div');
    div.className = 'product__card';
    div.style.animationDelay = `${index * 0.1}s`;
    
    const totalPrice = product.price + (product.price * product.gst / 100);
    
    div.innerHTML = `
        <div class="product__image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product__content">
            <h3 class="product__name">${product.name}</h3>
            <p class="product__description">${product.description}</p>
            <div class="product__price">
                <span class="product__price-main">₹${totalPrice.toFixed(0)}</span>
                <span class="product__price-gst">+${product.gst}% GST</span>
            </div>
            <div class="product__actions">
                <button class="btn btn--secondary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `;
    
    return div;
}

function setActiveFilter(activeBtn) {
    const filterBtns = document.querySelectorAll('.filter__btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Navigation functions
function toggleNav() {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    navMenu.classList.toggle('show');
    navToggle.classList.toggle('active');
}

// Cart functions
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('open');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        showNotification('Product added to cart!');
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartQuantity(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        updateCartUI();
    }
}

function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
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
            cartItems.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">Your cart is empty</p>';
        } else {
            cart.forEach(item => {
                const cartItem = createCartItemElement(item);
                cartItems.appendChild(cartItem);
            });
        }
    }
    
    // Update total
    const total = cart.reduce((sum, item) => {
        const itemTotal = item.price + (item.price * item.gst / 100);
        return sum + (itemTotal * item.quantity);
    }, 0);
    
    if (cartTotal) cartTotal.textContent = total.toFixed(0);
}

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart__item';
    
    const itemTotal = item.price + (item.price * item.gst / 100);
    
    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart__item-info">
            <div class="cart__item-name">${item.name}</div>
            <div class="cart__item-price">₹${itemTotal.toFixed(0)} × ${item.quantity}</div>
            <div class="cart__item-controls">
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" class="btn btn--secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">-</button>
                <span style="margin: 0 0.5rem;">${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" class="btn btn--secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">+</button>
                <button onclick="removeFromCart(${item.id})" class="btn btn--secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-left: 0.5rem;">Remove</button>
            </div>
        </div>
    `;
    
    return div;
}

function setupAnimations() {
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

function setupScrollEffects() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function handleScroll() {
    const header = document.getElementById('header');
    
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #f56500;
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 3000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;