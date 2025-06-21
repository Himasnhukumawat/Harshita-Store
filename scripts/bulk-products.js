const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, setDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCJ4JY0vjekg28It4y3v5pv-RWhVWzE6DU",
  authDomain: "harshitageneralstore-3d00d.firebaseapp.com",
  projectId: "harshitageneralstore-3d00d",
  storageBucket: "harshitageneralstore-3d00d.firebasestorage.app",
  messagingSenderId: "641816325196",
  appId: "1:641816325196:web:14c01e5b8445ac376ad8e9",
  measurementId: "G-0L46GS8PM3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample products for different categories
const sampleProducts = [
  // Saree Products
  {
    name: "Silk Kanjeevaram Saree",
    mrp: 2500,
    category: "Saree",
    subCategory: "Silk Sarees",
    stock: 10,
    tags: ["silk", "kanjeevaram", "traditional", "premium"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Cotton Handloom Saree",
    mrp: 800,
    category: "Saree",
    subCategory: "Cotton Sarees",
    stock: 25,
    tags: ["cotton", "handloom", "comfortable", "daily-wear"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Designer Georgette Saree",
    mrp: 1800,
    category: "Saree",
    subCategory: "Designer Sarees",
    stock: 8,
    tags: ["designer", "georgette", "party-wear", "elegant"],
    isActive: true,
    isAvailable: true
  },

  // Clothes Products
  {
    name: "Embroidered Cotton Kurti",
    mrp: 450,
    category: "Clothes",
    subCategory: "Kurtis",
    stock: 30,
    tags: ["kurti", "cotton", "embroidered", "casual"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Silk Salwar Kameez Set",
    mrp: 1200,
    category: "Clothes",
    subCategory: "Salwar Kameez",
    stock: 15,
    tags: ["salwar", "kameez", "silk", "traditional"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Kids Cotton Dress",
    mrp: 350,
    category: "Clothes",
    subCategory: "Kids Wear",
    stock: 20,
    tags: ["kids", "dress", "cotton", "comfortable"],
    isActive: true,
    isAvailable: true
  },

  // Kirana Products
  {
    name: "Basmati Rice 5kg",
    mrp: 250,
    category: "Kirana",
    subCategory: "Pulses & Grains",
    stock: 50,
    tags: ["rice", "basmati", "grain", "staple"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Toor Dal 1kg",
    mrp: 120,
    category: "Kirana",
    subCategory: "Pulses & Grains",
    stock: 40,
    tags: ["dal", "toor", "pulse", "protein"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Sunflower Oil 1L",
    mrp: 140,
    category: "Kirana",
    subCategory: "Cooking Oil",
    stock: 35,
    tags: ["oil", "sunflower", "cooking", "healthy"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Turmeric Powder 200g",
    mrp: 45,
    category: "Kirana",
    subCategory: "Spices & Masalas",
    stock: 60,
    tags: ["turmeric", "spice", "powder", "cooking"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Tea Bags 100 Count",
    mrp: 85,
    category: "Kirana",
    subCategory: "Tea & Coffee",
    stock: 25,
    tags: ["tea", "bags", "beverage", "daily"],
    isActive: true,
    isAvailable: true
  },

  // Sleepers Products
  {
    name: "Men's Comfort Sleepers",
    mrp: 299,
    category: "Sleepers",
    subCategory: "Men's Sleepers",
    stock: 30,
    tags: ["sleepers", "men", "comfort", "casual"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Women's Fashion Sleepers",
    mrp: 399,
    category: "Sleepers",
    subCategory: "Women's Sleepers",
    stock: 25,
    tags: ["sleepers", "women", "fashion", "stylish"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Kids Colorful Sleepers",
    mrp: 199,
    category: "Sleepers",
    subCategory: "Kids Sleepers",
    stock: 20,
    tags: ["sleepers", "kids", "colorful", "comfortable"],
    isActive: true,
    isAvailable: true
  },

  // Bangles Products
  {
    name: "Glass Bangles Set (12 pieces)",
    mrp: 150,
    category: "Bangles",
    subCategory: "Glass Bangles",
    stock: 40,
    tags: ["bangles", "glass", "traditional", "colorful"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Silver Plated Bangles",
    mrp: 450,
    category: "Bangles",
    subCategory: "Metal Bangles",
    stock: 15,
    tags: ["bangles", "silver", "metal", "elegant"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Designer Plastic Bangles",
    mrp: 80,
    category: "Bangles",
    subCategory: "Plastic Bangles",
    stock: 35,
    tags: ["bangles", "plastic", "designer", "affordable"],
    isActive: true,
    isAvailable: true
  },

  // Pooja Items Products
  {
    name: "Sandalwood Agarbatti Pack",
    mrp: 60,
    category: "Pooja Items",
    subCategory: "Incense & Agarbatti",
    stock: 45,
    tags: ["agarbatti", "sandalwood", "incense", "pooja"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Brass Diya Set (6 pieces)",
    mrp: 120,
    category: "Pooja Items",
    subCategory: "Diyas & Candles",
    stock: 20,
    tags: ["diya", "brass", "pooja", "traditional"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Ganesh Idol Small",
    mrp: 180,
    category: "Pooja Items",
    subCategory: "Idols & Pictures",
    stock: 12,
    tags: ["ganesh", "idol", "pooja", "religious"],
    isActive: true,
    isAvailable: true
  },

  // Jewelry Products
  {
    name: "Pearl Necklace Set",
    mrp: 650,
    category: "Jewelry",
    subCategory: "Necklaces",
    stock: 8,
    tags: ["necklace", "pearl", "jewelry", "elegant"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Gold Plated Earrings",
    mrp: 350,
    category: "Jewelry",
    subCategory: "Earrings",
    stock: 18,
    tags: ["earrings", "gold", "plated", "fashion"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Silver Anklet Set",
    mrp: 280,
    category: "Jewelry",
    subCategory: "Anklets",
    stock: 12,
    tags: ["anklet", "silver", "foot", "jewelry"],
    isActive: true,
    isAvailable: true
  },

  // Home & Kitchen Products
  {
    name: "Non-stick Pan Set",
    mrp: 850,
    category: "Home & Kitchen",
    subCategory: "Kitchen Utensils",
    stock: 10,
    tags: ["pan", "non-stick", "kitchen", "cooking"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Plastic Storage Containers",
    mrp: 200,
    category: "Home & Kitchen",
    subCategory: "Storage Containers",
    stock: 25,
    tags: ["storage", "containers", "plastic", "kitchen"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Floor Cleaner Liquid",
    mrp: 95,
    category: "Home & Kitchen",
    subCategory: "Cleaning Supplies",
    stock: 30,
    tags: ["cleaner", "floor", "liquid", "cleaning"],
    isActive: true,
    isAvailable: true
  }
];

async function addBulkProducts() {
  console.log('🚀 Starting bulk product import...');
  
  for (const product of sampleProducts) {
    try {
      // Add to products collection
      const productRef = await addDoc(collection(db, "products"), {
        ...product,
        createdAt: serverTimestamp(),
      });

      // Also add to product_lists collection
      await setDoc(doc(db, "product_lists", productRef.id), {
        name: product.name,
        mrp: product.mrp,
        category: product.category,
        subCategory: product.subCategory,
        isActive: product.isActive,
        isAvailable: product.isAvailable,
        createdAt: serverTimestamp(),
      });

      console.log(`✅ Added product: ${product.name} (ID: ${productRef.id})`);
    } catch (error) {
      console.error(`❌ Error adding product ${product.name}:`, error);
    }
  }
  
  console.log('🎉 Bulk product import completed!');
  process.exit(0);
}

addBulkProducts(); 