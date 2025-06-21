# 🏪 Admin Panel Setup Guide

## 📋 **Quick Setup Instructions**

### **Step 1: Set up Categories (One-time setup)**

Run this command to automatically create all your main categories with sub-categories:

```bash
node scripts/setup-categories.js
```

This will create:
- **Saree** (Silk, Cotton, Georgette, Designer, Bridal)
- **Clothes** (Kurtis, Salwar Kameez, Dresses, Tops, Pants & Jeans, Kids Wear)
- **Kirana** (Pulses & Grains, Cooking Oil, Spices & Masalas, Sugar & Salt, Tea & Coffee, Snacks, Beverages, Personal Care)
- **Sleepers** (Men's, Women's, Kids, Designer, Sports)
- **Bangles** (Glass, Metal, Plastic, Designer, Bridal)
- **Pooja Items** (Incense & Agarbatti, Diyas & Candles, Idols & Pictures, Pooja Thali, Kumkum & Chandan, Flowers & Garlands)
- **Jewelry** (Necklaces, Earrings, Rings, Anklets, Nose Pins, Hair Accessories)
- **Home & Kitchen** (Kitchen Utensils, Storage Containers, Cleaning Supplies, Bedding, Bathroom Items, Home Decor)

### **Step 2: Add Sample Products (Optional)**

Run this command to add sample products for all categories:

```bash
node scripts/bulk-products.js
```

This will add 30+ sample products across all categories with realistic prices and stock levels.

## 🎯 **How to Manage Your Store**

### **Adding Categories Manually**

1. Go to **Admin Panel** → **Categories** → **Add Category**
2. Enter category name (e.g., "Saree")
3. Add description
4. Upload category image (optional)
5. Add sub-categories:
   - Click "Add Sub-Category"
   - Enter sub-category name (e.g., "Silk Sarees")
   - Add description
   - Repeat for all sub-categories
6. Click "Create Category"

### **Adding Products**

1. Go to **Admin Panel** → **Products** → **Add Product**
2. Fill in product details:
   - **Product Name**: e.g., "Silk Kanjeevaram Saree"
   - **Category**: Select from dropdown (e.g., "Saree")
   - **Sub-Category**: Select from dropdown (e.g., "Silk Sarees")
   - **MRP**: Enter price in ₹
   - **Stock**: Enter available quantity
   - **Product Image**: Upload product photo
   - **Status**: Active/Inactive toggle
   - **Availability**: Available/Unavailable toggle
3. Click "Create Product"

### **Managing Products**

- **View All Products**: Admin Panel → Products
- **Search Products**: Use search bar to find specific products
- **Filter Products**: Filter by status, availability, or category
- **Edit Products**: Click edit button on any product card
- **Delete Products**: Click delete button (with confirmation)
- **Toggle Status**: Use switches to quickly change product status

## 📊 **Category Structure Examples**

### **Saree Category**
```
Saree
├── Silk Sarees
│   ├── Kanjeevaram Silk Saree
│   ├── Banarasi Silk Saree
│   └── Mysore Silk Saree
├── Cotton Sarees
│   ├── Handloom Cotton Saree
│   ├── Printed Cotton Saree
│   └── Embroidered Cotton Saree
├── Georgette Sarees
│   ├── Designer Georgette Saree
│   └── Party Wear Georgette Saree
└── Bridal Sarees
    ├── Wedding Silk Saree
    └── Reception Saree
```

### **Kirana Category**
```
Kirana
├── Pulses & Grains
│   ├── Basmati Rice 5kg
│   ├── Toor Dal 1kg
│   └── Moong Dal 500g
├── Cooking Oil
│   ├── Sunflower Oil 1L
│   ├── Mustard Oil 500ml
│   └── Groundnut Oil 1L
├── Spices & Masalas
│   ├── Turmeric Powder 200g
│   ├── Red Chilli Powder 100g
│   └── Garam Masala 50g
└── Personal Care
    ├── Bath Soap
    ├── Shampoo
    └── Toothpaste
```

## 🖼️ **Image Management**

### **Category Images**
- Upload category banner images
- Recommended size: 400x300 pixels
- Formats: JPG, PNG, WebP
- Used for category display in admin panel

### **Product Images**
- Upload high-quality product photos
- Recommended size: 800x600 pixels
- Formats: JPG, PNG, WebP
- Used for product display and customer view

## 🔍 **Search and Filter Features**

### **Product Search**
- Search by product name
- Search by category name
- Search by tags
- Real-time search results

### **Product Filtering**
- **Status Filter**: Active/Inactive products
- **Availability Filter**: Available/Unavailable products
- **Category Filter**: Filter by main category
- **Stock Filter**: Low stock products

## 📱 **Admin Panel Features**

### **Dashboard**
- Total products count
- Total categories count
- Active products count
- Low stock alerts
- Recent products

### **Category Management**
- View all categories in grid layout
- Add new categories with sub-categories
- Edit existing categories
- Delete categories (with confirmation)
- Category image management

### **Product Management**
- View all products in grid layout
- Add new products with images
- Edit product details
- Delete products (with confirmation)
- Bulk status updates
- Stock management

## 🚀 **Tips for Efficient Management**

1. **Use Sub-Categories**: Organize products properly using sub-categories
2. **Add Tags**: Use relevant tags for better search
3. **Upload Images**: Always add product images for better presentation
4. **Regular Updates**: Keep stock levels updated
5. **Status Management**: Use active/inactive status to control visibility
6. **Bulk Operations**: Use the setup scripts for initial data

## 🔧 **Troubleshooting**

### **Common Issues**
1. **Image not uploading**: Check file size and format
2. **Category not showing**: Ensure category is active
3. **Product not appearing**: Check if product is active and available
4. **Search not working**: Clear browser cache and try again

### **Support**
- Check the console for error messages
- Ensure Firebase connection is working
- Verify all required fields are filled

## 📈 **Scaling Your Store**

As your store grows:
1. Add more sub-categories as needed
2. Use tags for better product organization
3. Regular inventory updates
4. Monitor low stock products
5. Archive old products instead of deleting

---

**Happy Managing! 🎉** 