// Contact Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
});

function initializeContactPage() {
    setupContactEventListeners();
    updateCartUI();
    updateWishlistUI();
}

function setupContactEventListeners() {
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    contactForm?.addEventListener('submit', handleContactFormSubmit);

    // Cart and wishlist buttons
    const cartBtn = document.getElementById('cart-btn');
    const wishlistBtn = document.getElementById('wishlist-btn');
    const cartClose = document.getElementById('cart-close');
    const wishlistClose = document.getElementById('wishlist-close');

    cartBtn?.addEventListener('click', toggleCart);
    wishlistBtn?.addEventListener('click', toggleWishlist);
    cartClose?.addEventListener('click', toggleCart);
    wishlistClose?.addEventListener('click', toggleWishlist);
}

function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject') || 'Contact Form Inquiry',
        message: formData.get('message')
    };
    
    // Create mailto link
    const subject = encodeURIComponent(`Contact Form: ${contactData.subject}`);
    const body = encodeURIComponent(`
Name: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject}

Message:
${contactData.message}
    `);
    
    const mailtoLink = `mailto:merchant@example.com?subject=${subject}&body=${body}`;
    
    // Try to open email client
    try {
        window.location.href = mailtoLink;
        
        // Store message in localStorage as backup
        const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        messages.unshift({
            ...contactData,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        // Show success message
        showNotification('Message sent! Your email client should open shortly.');
        
        // Reset form
        e.target.reset();
        
    } catch (error) {
        console.error('Error opening email client:', error);
        showNotification('Please copy the message and send it manually to merchant@example.com', 'error');
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
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
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

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar?.classList.toggle('open');
}

function toggleWishlist() {
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    wishlistSidebar?.classList.toggle('open');
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 3000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        font-size: 0.9rem;
        font-weight: 600;
        max-width: 300px;
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
    }, 5000);
}

// Cart functions (simplified for contact page)
function addToCart(productId) {
    // This would typically be implemented with full product data
    showNotification('Please visit the product page to add items to cart');
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
            updateCartUI();
        }
    }
}

function toggleWishlistItem(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingIndex = wishlist.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification('Removed from wishlist');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleWishlistItem = toggleWishlistItem;
