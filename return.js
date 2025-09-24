// Return Request System - AN Enterprises
document.addEventListener('DOMContentLoaded', function() {
    initializeReturnPage();
});

// Merchant Configuration - REPLACE WITH ACTUAL DETAILS
const MERCHANT_PHONE = '+91XXXXXXXXXX';
const MERCHANT_EMAIL = 'merchant@example.com';

function initializeReturnPage() {
    setupReturnEventListeners();
    loadPreviousOrders();
    updateCartUI();
    updateWishlistUI();
}

function setupReturnEventListeners() {
    // Return form submission
    const submitReturnBtn = document.getElementById('submit-return');
    submitReturnBtn?.addEventListener('click', handleReturnSubmit);

    // Modal close buttons
    const closeReturnSuccess = document.getElementById('close-return-success');
    const closeReturnFallback = document.getElementById('close-return-fallback');
    closeReturnSuccess?.addEventListener('click', () => closeModal('return-success-modal'));
    closeReturnFallback?.addEventListener('click', () => closeModal('return-fallback-modal'));

    // Copy return details
    const copyReturnDetailsBtn = document.getElementById('copy-return-details');
    copyReturnDetailsBtn?.addEventListener('click', copyReturnDetails);

    // Order ID selection
    const orderIdSelect = document.getElementById('order-id-select');
    const orderIdInput = document.getElementById('order-id');
    
    orderIdSelect?.addEventListener('change', (e) => {
        if (e.target.value) {
            orderIdInput.value = e.target.value;
            // Auto-fill customer details if available
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const selectedOrder = orders.find(order => order.orderId === e.target.value);
            if (selectedOrder) {
                document.getElementById('customer-name').value = selectedOrder.customer.name || '';
                document.getElementById('customer-phone').value = selectedOrder.customer.phone || '';
                document.getElementById('customer-email').value = selectedOrder.customer.email || '';
            }
        }
    });

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

function loadPreviousOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIdSelect = document.getElementById('order-id-select');
    const orderIdInput = document.getElementById('order-id');
    
    if (orders.length > 0 && orderIdSelect) {
        // Show dropdown if orders exist
        orderIdSelect.style.display = 'block';
        orderIdInput.style.display = 'none';
        
        // Add orders to dropdown
        orders.forEach(order => {
            const option = document.createElement('option');
            option.value = order.orderId;
            option.textContent = `${order.orderId} - ${order.customer.name}`;
            orderIdSelect.appendChild(option);
        });
        
        // Add option to enter manually
        const manualOption = document.createElement('option');
        manualOption.value = 'manual';
        manualOption.textContent = 'Enter Order ID manually';
        orderIdSelect.appendChild(manualOption);
        
        // Handle manual entry
        orderIdSelect.addEventListener('change', (e) => {
            if (e.target.value === 'manual') {
                orderIdSelect.style.display = 'none';
                orderIdInput.style.display = 'block';
                orderIdInput.focus();
            }
        });
    }
}

function handleReturnSubmit() {
    if (!validateReturnForm()) {
        return;
    }

    const formData = new FormData(document.getElementById('return-form'));
    const returnData = {
        orderId: document.getElementById('order-id').value || document.getElementById('order-id-select').value,
        customerName: formData.get('customerName'),
        customerPhone: formData.get('customerPhone'),
        customerEmail: formData.get('customerEmail') || '',
        returnReason: document.getElementById('return-reason').value,
        returnOption: document.querySelector('input[name="returnOption"]:checked').value
    };

    // Create return request text
    const returnText = createReturnText(returnData);
    
    // Try to open WhatsApp and Email
    const success = openReturnWhatsAppAndEmail(returnText);
    
    if (success) {
        // Show success modal
        showReturnSuccessModal();
        
        // Clear form
        document.getElementById('return-form').reset();
        document.getElementById('return-reason').value = '';
    } else {
        // Show fallback modal
        showReturnFallbackModal(returnText);
    }
}

function validateReturnForm() {
    const orderId = document.getElementById('order-id').value || document.getElementById('order-id-select').value;
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const returnReason = document.getElementById('return-reason').value;
    
    let isValid = true;

    // Validate Order ID
    if (!orderId) {
        showFieldError('order-id', 'Order ID is required');
        isValid = false;
    } else if (!validateOrderIdFormat(orderId)) {
        showFieldError('order-id', 'Invalid Order ID format (should be ANE-YYYYMMDD-XXXX)');
        isValid = false;
    } else {
        clearFieldError('order-id');
    }

    // Validate Customer Name
    if (!customerName.trim()) {
        showFieldError('customer-name', 'Customer name is required');
        isValid = false;
    } else {
        clearFieldError('customer-name');
    }

    // Validate Phone
    if (!customerPhone.trim()) {
        showFieldError('customer-phone', 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(customerPhone)) {
        showFieldError('customer-phone', 'Please enter a valid Indian mobile number');
        isValid = false;
    } else {
        clearFieldError('customer-phone');
    }

    // Validate Return Reason
    if (!returnReason.trim()) {
        showFieldError('return-reason', 'Please provide a reason for return');
        isValid = false;
    } else {
        clearFieldError('return-reason');
    }

    return isValid;
}

function validateOrderIdFormat(orderId) {
    const orderIdRegex = /^ANE-\d{8}-\d{4}$/;
    return orderIdRegex.test(orderId);
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

function createReturnText(returnData) {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const returnOption = returnData.returnOption === 'refund' ? 'Refund' : 'Exchange';
    
    let returnText = `AN Enterprise — Return Request\n`;
    returnText += `------------------------\n`;
    returnText += `Order ID: ${returnData.orderId}\n`;
    returnText += `Name: ${returnData.customerName}\n`;
    returnText += `Phone: ${returnData.customerPhone}\n`;
    if (returnData.customerEmail) returnText += `Email: ${returnData.customerEmail}\n`;
    returnText += `Reason: ${returnData.returnReason}\n`;
    returnText += `Return Option: ${returnOption}\n`;
    returnText += `------------------------\n`;
    returnText += `Submitted on: ${currentDate}\n`;
    
    return returnText;
}

function openReturnWhatsAppAndEmail(returnText) {
    try {
        // Check if merchant details are still placeholders
        if (MERCHANT_PHONE.includes('XXXX') || MERCHANT_EMAIL.includes('example.com')) {
            console.warn('Merchant details not configured properly');
            return false;
        }

        // Create WhatsApp URL
        const waText = encodeURIComponent(returnText);
        const waUrl = `https://wa.me/${MERCHANT_PHONE.replace(/\D/g, '')}?text=${waText}`;
        
        // Create Email URL
        const emailSubject = encodeURIComponent('Return Request');
        const emailBody = encodeURIComponent(returnText);
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

function showReturnSuccessModal() {
    const modal = document.getElementById('return-success-modal');
    if (modal) modal.style.display = 'flex';
}

function showReturnFallbackModal(returnText) {
    const modal = document.getElementById('return-fallback-modal');
    const returnDetailsText = document.getElementById('return-details-text');
    
    if (returnDetailsText) returnDetailsText.value = returnText;
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function copyReturnDetails() {
    const returnDetailsText = document.getElementById('return-details-text');
    if (returnDetailsText) {
        returnDetailsText.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('copy-return-details');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }
}

// Cart and Wishlist functions
function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cart-count');
    
    if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateWishlistUI() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = document.getElementById('wishlist-count');
    
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
