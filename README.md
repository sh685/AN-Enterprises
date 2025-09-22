# AN Enterprises - Premium eCommerce Website

A modern, responsive eCommerce website built with vanilla HTML, CSS, and JavaScript for AN Enterprises, specializing in premium home, kitchen, and décor products.

## Features

### 🛍️ Core eCommerce Functionality
- **Product Catalog**: Organized by Kitchen and Décor categories
- **Shopping Cart**: Dynamic cart with real-time updates
- **Quick View**: Product modals with detailed information
- **Search & Filters**: Advanced filtering and sorting options
- **Checkout System**: Complete order processing with invoice generation

### 🎨 Premium Design
- **Modern UI**: Clean, elegant design with earthy color palette
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Smooth Animations**: Fade-in effects and hover transitions
- **Accessibility**: Keyboard navigation and screen reader friendly

### 💡 Advanced Features
- **PWA Ready**: Progressive Web App with offline capability
- **Invoice Generation**: Automatic PDF-style invoice creation
- **Local Storage**: Persistent cart and user preferences
- **SEO Optimized**: Meta tags and structured data
- **Fast Loading**: Optimized images and lazy loading

## File Structure

```
/
├── index.html          # Homepage with hero and featured products
├── kitchen.html        # Kitchen products page
├── decor.html          # Décor products page  
├── about.html          # About us page
├── contact.html        # Contact page with form
├── styles.css          # Global styles and responsive design
├── app.js              # Main JavaScript functionality
├── products.js         # Product data and catalog
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline functionality
├── assets/             # Images and media files
└── README.md           # This file
```

## Setup Instructions

### 1. Basic Setup
```bash
# Clone or download the files
# Open index.html in a web browser
# Or serve with a local server:
npx serve .
```

### 2. Add Your Logo
1. Replace `assets/logo.jpeg` with your company logo
2. Recommended size: 200x200px, square format
3. Update `manifest.json` if changing logo name

### 3. Update Product Images
1. Add your product images to the `assets/` folder
2. Update image URLs in `products.js`:
```javascript
// Replace Unsplash URLs with your images
image: "assets/your-product-image.jpg"
```

### 4. Customize Content
- **Company Information**: Update contact details in footer and contact page
- **Product Data**: Modify `products.js` with your actual products
- **Colors**: Change CSS variables in `styles.css` if needed
- **About Page**: Update company story and team information

### 5. Deploy
- Upload all files to your web hosting provider
- Ensure HTTPS for PWA functionality
- Configure redirects for clean URLs if needed

## Product Management

### Adding New Products
1. Open `products.js`
2. Add new product object to the array:
```javascript
{
    id: 21, // Unique ID
    name: "Product Name",
    price: 2999,
    category: "kitchen" or "decor",
    subcategory: "cookware", // optional
    image: "assets/product-image.jpg",
    description: "Product description...",
    featured: false, // true for homepage display
    rating: 4.5, // optional
    reviews: 123 // optional
}
```

### Categories
- **Kitchen**: cookware, appliances, tools, storage, cutlery
- **Décor**: lighting, wall-art, furniture, accessories

## Customization

### Colors (CSS Variables)
```css
:root {
    --primary-color: #636B2F;   /* Olive Green */
    --secondary-color: #BAC095; /* Sage */
    --accent-color: #D4DE95;    /* Pastel Lime */
    --dark-color: #3D4127;      /* Dark Moss */
    --light-bg: #FAF8F5;        /* Light Background */
}
```

### Invoice Customization
- Edit the `generateInvoice()` function in `app.js`
- Update company details, tax rates, and terms
- Modify invoice template HTML structure

### Contact Form
- Form submissions are handled client-side (demo)
- Integrate with your preferred form processing service
- Update the `handleContactForm()` function for real submission

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips
1. **Optimize Images**: Compress product images (WebP format recommended)
2. **Enable Gzip**: Configure server compression
3. **CDN**: Use a Content Delivery Network for faster loading
4. **Lazy Loading**: Already implemented for product images

## Security Notes
- Form validation is client-side only
- Implement server-side validation for production
- Use HTTPS for secure data transmission
- Sanitize user inputs on the server

## SEO Features
- Semantic HTML structure
- Meta descriptions and titles
- Open Graph tags for social sharing
- Structured data for products
- Sitemap ready structure

## Troubleshooting

### Cart Not Saving
- Check browser local storage permissions
- Clear browser cache and try again

### Images Not Loading
- Verify image file paths in `products.js`
- Check that images exist in `assets/` folder
- Ensure proper file permissions

### PWA Not Installing
- Serve over HTTPS (required for PWA)
- Check `manifest.json` validity
- Verify service worker registration

## License
This project is provided as-is for AN Enterprises. Modify and use according to your needs.

## Support
For technical support or customization requests, contact the development team.

---

**AN Enterprises** - Transform Your Space with Premium Products