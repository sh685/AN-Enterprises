/*
 * CHECKOUT SYSTEM - AN Enterprises
 * 
 * MERCHANT CONFIGURATION:
 * Replace these placeholders with actual merchant details:
 * - MERCHANT_PHONE: Replace '+91XXXXXXXXXX' with actual WhatsApp number
 * - MERCHANT_EMAIL: Replace 'merchant@example.com' with actual email
 * - UPI_ID: Replace 'yourupi@bank' with actual UPI ID
 * 
 * FUNCTIONALITY:
 * - Client-side only checkout system
 * - WhatsApp integration via wa.me links
 * - Email integration via mailto: links
 * - Printable invoice generation
 * - Order storage in localStorage
 * - Popup fallback for blocked popups
 */

// Merchant Configuration - REPLACE WITH ACTUAL DETAILS
const MERCHANT_PHONE = '+91XXXXXXXXXX';
const MERCHANT_EMAIL = 'merchant@example.com';
const UPI_ID = 'yourupi@bank';

// Global variables
let cart = [];
let orderTotal = 0;
let discount = 0;
let appliedCoupon = '';

document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

function initializeCheckout() {
    loadCart();
    setupEventListeners();
    renderOrderSummary();
    updateCartUI();
}

function setupEventListeners() {
    // Payment method change
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    paymentOptions.forEach(option => {
        option.addEventListener('change', handlePaymentMethodChange);
    });

    // Form submission
    const placeOrderBtn = document.getElementById('place-order');
    placeOrderBtn?.addEventListener('click', handlePlaceOrder);

    // Back to cart
    const backToCartBtn = document.getElementById('back-to-cart');
    backToCartBtn?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Coupon application
    const applyCouponBtn = document.getElementById('apply-coupon');
    applyCouponBtn?.addEventListener('click', handleApplyCoupon);

    // Copy UPI ID
    const copyUpiBtn = document.getElementById('copy-upi');
    copyUpiBtn?.addEventListener('click', copyUpiId);

    // Modal close buttons
    const closeSuccessModal = document.getElementById('close-success-modal');
    const closeFallbackModal = document.getElementById('close-fallback-modal');
    closeSuccessModal?.addEventListener('click', () => closeModal('success-modal'));
    closeFallbackModal?.addEventListener('click', () => closeModal('fallback-modal'));

    // Copy order details
    const copyOrderDetailsBtn = document.getElementById('copy-order-details');
    copyOrderDetailsBtn?.addEventListener('click', copyOrderDetails);

    // Cart sidebar
    const cartBtn = document.getElementById('cart-btn');
    const cartClose = document.getElementById('cart-close');
    cartBtn?.addEventListener('click', toggleCart);
    cartClose?.addEventListener('click', toggleCart);

    // Wishlist sidebar
    const wishlistBtn = document.getElementById('wishlist-btn');
    const wishlistClose = document.getElementById('wishlist-close');
    wishlistBtn?.addEventListener('click', toggleWishlist);
    wishlistClose?.addEventListener('click', toggleWishlist);
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        // Redirect to home if cart is empty
        window.location.href = 'index.html';
    }
}

function renderOrderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const discountEl = document.getElementById('discount');
    const finalTotalEl = document.getElementById('final-total');
    const discountRow = document.getElementById('discount-row');

    if (!summaryItems) return;

    // Render items
    summaryItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const itemEl = document.createElement('div');
        itemEl.className = 'summary__item';
        itemEl.innerHTML = `
            <div class="item__info">
                <div class="item__name">${item.name}</div>
                <div class="item__brand">${item.brand}</div>
                <div class="item__price">₹${item.price} x ${item.quantity}</div>
            </div>
            <div class="item__total">₹${itemTotal}</div>
        `;
        summaryItems.appendChild(itemEl);
    });

    // Calculate totals
    const shipping = subtotal > 1000 ? 0 : 50;
    const finalTotal = subtotal + shipping - discount;

    // Update display
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (shippingEl) shippingEl.textContent = `₹${shipping}`;
    if (discountEl) discountEl.textContent = `-₹${discount}`;
    if (finalTotalEl) finalTotalEl.textContent = `₹${finalTotal}`;

    // Show/hide discount row
    if (discountRow) {
        discountRow.style.display = discount > 0 ? 'flex' : 'none';
    }

    orderTotal = finalTotal;
}

function handlePaymentMethodChange(e) {
    const upiDetails = document.getElementById('upi-details');
    const upiIdEl = document.querySelector('.upi__info p strong');
    
    if (e.target.value === 'gpay') {
        upiDetails.style.display = 'block';
        if (upiIdEl) {
            upiIdEl.nextSibling.textContent = ` ${UPI_ID}`;
        }
    } else {
        upiDetails.style.display = 'none';
    }
}

function handleApplyCoupon() {
    const couponInput = document.getElementById('coupon-code');
    const couponMessage = document.getElementById('coupon-message');
    const couponCode = couponInput?.value.trim().toUpperCase();

    if (!couponCode) {
        showCouponMessage('Please enter a coupon code', 'error');
        return;
    }

    // Simulate coupon validation
    const coupons = {
        'WELCOME10': { discount: 10, type: 'percentage', description: '10% off on your order' },
        'SAVE50': { discount: 50, type: 'fixed', description: '₹50 off on your order' },
        'NEWUSER': { discount: 15, type: 'percentage', description: '15% off for new users' }
    };

    const coupon = coupons[couponCode];
    if (coupon) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (coupon.type === 'percentage') {
            discount = Math.round((subtotal * coupon.discount) / 100);
        } else {
            discount = coupon.discount;
        }
        
        appliedCoupon = couponCode;
        renderOrderSummary();
        showCouponMessage(`Coupon applied! ${coupon.description}`, 'success');
        couponInput.disabled = true;
        document.getElementById('apply-coupon').textContent = 'Applied';
    } else {
        showCouponMessage('Invalid coupon code', 'error');
    }
}

function showCouponMessage(message, type) {
    const couponMessage = document.getElementById('coupon-message');
    if (couponMessage) {
        couponMessage.textContent = message;
        couponMessage.className = `coupon__message ${type}`;
        setTimeout(() => {
            couponMessage.textContent = '';
            couponMessage.className = 'coupon__message';
        }, 3000);
    }
}

function copyUpiId() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
        const btn = document.getElementById('copy-upi');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

function handlePlaceOrder() {
    if (!validateForm()) {
        return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    
    // Check if GPay payment is completed
    if (paymentMethod === 'gpay') {
        const paymentDone = document.getElementById('payment-done')?.checked;
        if (!paymentDone) {
            alert('Please complete the payment and check the confirmation box.');
            return;
        }
    }

    // Generate order
    const orderData = generateOrder();
    
    // Save order to localStorage
    saveOrder(orderData);
    
    // Create order text
    const orderText = createOrderText(orderData);
    
    // Try to open WhatsApp and Email
    const success = openWhatsAppAndEmail(orderText, orderData.orderId);
    
    if (success) {
        // Show success modal
        showSuccessModal(orderData.orderId);
        
        // Open printable invoice
        openPrintableInvoice(orderData);
        
        // Clear cart
        localStorage.removeItem('cart');
    } else {
        // Show fallback modal
        showFallbackModal(orderText);
    }
}

function validateForm() {
    const requiredFields = ['fullName', 'phone', 'address'];
    let isValid = true;

    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const errorEl = document.getElementById(`${fieldName}-error`);
        
        if (!field?.value.trim()) {
            showFieldError(fieldName, 'This field is required');
            isValid = false;
        } else if (fieldName === 'phone' && !validatePhone(field.value)) {
            showFieldError(fieldName, 'Please enter a valid Indian mobile number');
            isValid = false;
        } else {
            clearFieldError(fieldName);
        }
    });

    return isValid;
}

function validatePhone(phone) {
    const phoneRegex = /^[6-9][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function showFieldError(fieldName, message) {
    const errorEl = document.getElementById(`${fieldName}-error`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

function clearFieldError(fieldName) {
    const errorEl = document.getElementById(`${fieldName}-error`);
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }
}

function generateOrder() {
    const formData = new FormData(document.getElementById('checkout-form'));
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    
    const orderId = `ANE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000) + 1000}`;
    
    return {
        orderId,
        customer: {
            name: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email') || '',
            address: formData.get('address'),
            pincode: formData.get('pincode') || '',
            landmark: formData.get('landmark') || ''
        },
        items: cart,
        payment: {
            method: paymentMethod === 'gpay' ? 'GPay (Prepaid)' : 'Cash On Delivery',
            status: paymentMethod === 'gpay' ? 'Paid' : 'Pending'
        },
        totals: {
            subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            shipping: orderTotal > 1000 ? 0 : 50,
            discount: discount,
            total: orderTotal
        },
        coupon: appliedCoupon,
        timestamp: new Date().toISOString()
    };
}

function createOrderText(orderData) {
    const { customer, items, payment, totals, orderId } = orderData;
    
    let orderText = `AN Enterprises — New Order\n`;
    orderText += `------------------------\n`;
    orderText += `Name: ${customer.name}\n`;
    orderText += `Phone: ${customer.phone}\n`;
    if (customer.email) orderText += `Email: ${customer.email}\n`;
    orderText += `Address: ${customer.address}`;
    if (customer.pincode) orderText += `, ${customer.pincode}`;
    orderText += `\n`;
    if (customer.landmark) orderText += `Landmark: ${customer.landmark}\n`;
    orderText += `Payment method: ${payment.method}\n\n`;
    
    orderText += `Items:\n`;
    items.forEach((item, index) => {
        orderText += `${index + 1}) ${item.name} — ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });
    
    orderText += `------------------------\n`;
    orderText += `Subtotal: ₹${totals.subtotal}\n`;
    orderText += `Shipping: ₹${totals.shipping}\n`;
    if (totals.discount > 0) orderText += `Discount: -₹${totals.discount}\n`;
    orderText += `Total: ₹${totals.total}\n`;
    orderText += `Order ID: ${orderId}\n`;
    
    return orderText;
}

function saveOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.unshift(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
}

function openWhatsAppAndEmail(orderText, orderId) {
    try {
        // Check if merchant details are still placeholders
        if (MERCHANT_PHONE.includes('XXXX') || MERCHANT_EMAIL.includes('example.com')) {
            console.warn('Merchant details not configured properly');
            return false;
        }

        // Create WhatsApp URL
        const waText = encodeURIComponent(orderText);
        const waUrl = `https://wa.me/${MERCHANT_PHONE.replace(/\D/g, '')}?text=${waText}`;
        
        // Create Email URL
        const emailSubject = encodeURIComponent(`New Order ${orderId}`);
        const emailBody = encodeURIComponent(orderText);
        const emailUrl = `mailto:${MERCHANT_EMAIL}?subject=${emailSubject}&body=${emailBody}`;
        
        // Try to open both
        const waWindow = window.open(waUrl, '_blank');
        setTimeout(() => {
            window.open(emailUrl, '_blank');
        }, 1000);
        
        return waWindow !== null;
    } catch (error) {
        console.error('Error opening WhatsApp/Email:', error);
        return false;
    }
}

function showSuccessModal(orderId) {
    const modal = document.getElementById('success-modal');
    const orderIdEl = document.getElementById('order-id');
    
    if (orderIdEl) orderIdEl.textContent = orderId;
    if (modal) modal.style.display = 'flex';
}

function showFallbackModal(orderText) {
    const modal = document.getElementById('fallback-modal');
    const orderDetailsText = document.getElementById('order-details-text');
    
    if (orderDetailsText) orderDetailsText.value = orderText;
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
    
    if (modalId === 'success-modal') {
        window.location.href = 'index.html';
    }
}

function copyOrderDetails() {
    const orderDetailsText = document.getElementById('order-details-text');
    if (orderDetailsText) {
        orderDetailsText.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('copy-order-details');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }
}

function openPrintableInvoice(orderData) {
    const invoiceWindow = window.open('', '_blank');
    const invoiceHTML = generateInvoiceHTML(orderData);
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    
    // Auto-print after a short delay
    setTimeout(() => {
        invoiceWindow.print();
    }, 1000);
}

function generateInvoiceHTML(orderData) {
    const { customer, items, payment, totals, orderId } = orderData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice - ${orderId}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .invoice-table th { background-color: #f2f2f2; }
            .totals { text-align: right; margin-top: 20px; }
            .print-btn { margin: 20px 0; text-align: center; }
            @media print { .print-btn { display: none; } }
        </style>
    </head>
    <body>
        <div class="invoice-header">
            <h1>AN Enterprises</h1>
            <p>Premium home products for modern living</p>
            <h2>INVOICE</h2>
        </div>
        
        <div class="invoice-details">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${payment.method}</p>
        </div>
        
        <div class="customer-details">
            <h3>Customer Details:</h3>
            <p><strong>Name:</strong> ${customer.name}</p>
            <p><strong>Phone:</strong> ${customer.phone}</p>
            ${customer.email ? `<p><strong>Email:</strong> ${customer.email}</p>` : ''}
            <p><strong>Address:</strong> ${customer.address}${customer.pincode ? `, ${customer.pincode}` : ''}</p>
            ${customer.landmark ? `<p><strong>Landmark:</strong> ${customer.landmark}</p>` : ''}
        </div>
        
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.brand}</td>
                        <td>₹${item.price}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.price * item.quantity}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals">
            <p><strong>Subtotal: ₹${totals.subtotal}</strong></p>
            <p><strong>Shipping: ₹${totals.shipping}</strong></p>
            ${totals.discount > 0 ? `<p><strong>Discount: -₹${totals.discount}</strong></p>` : ''}
            <h3><strong>Total: ₹${totals.total}</strong></h3>
        </div>
        
        <div class="print-btn">
            <button onclick="window.print()">Print Invoice</button>
        </div>
    </body>
    </html>
    `;
}

// Cart and Wishlist functions
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const wishlistCount = document.getElementById('wishlist-count');
    
    if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlistCount) wishlistCount.textContent = wishlist.length;
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar?.classList.toggle('open');
}

function toggleWishlist() {
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    wishlistSidebar?.classList.toggle('open');
}
