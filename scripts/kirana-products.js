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

// Comprehensive Kirana Products with Hindi names
const kiranaProducts = [
  // Sugar & Salt Category
  {
    name: "Black Salt (काला नमक)",
    mrp: 20,
    category: "Kirana (किराना)",
    subCategory: "Sugar & Salt",
    stock: 50,
    tags: ["salt", "black salt", "kala namak", "spice"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "White Salt (सफेद नमक)",
    mrp: 18,
    category: "Kirana (किराना)",
    subCategory: "Sugar & Salt",
    stock: 100,
    tags: ["salt", "white salt", "cooking", "essential"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Iodized Salt (आयोडीन युक्त नमक)",
    mrp: 22,
    category: "Kirana (किराना)",
    subCategory: "Sugar & Salt",
    stock: 80,
    tags: ["salt", "iodized", "healthy", "essential"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Sugar (चीनी)",
    mrp: 45,
    category: "Kirana (किराना)",
    subCategory: "Sugar & Salt",
    stock: 60,
    tags: ["sugar", "sweetener", "essential", "cooking"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Jaggery (गुड़)",
    mrp: 60,
    category: "Kirana (किराना)",
    subCategory: "Sugar & Salt",
    stock: 30,
    tags: ["jaggery", "gur", "natural", "sweetener"],
    isActive: true,
    isAvailable: true
  },

  // Pulses & Grains Category
  {
    name: "Basmati Rice (बासमती चावल)",
    mrp: 120,
    category: "Kirana (किराना)",
    subCategory: "Pulses & Grains",
    stock: 40,
    tags: ["rice", "basmati", "premium", "aromatic"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Regular Rice (सामान्य चावल)",
    mrp: 80,
    category: "Kirana (किराना)",
    subCategory: "Pulses & Grains",
    stock: 60,
    tags: ["rice", "regular", "daily", "staple"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Toor Dal (तूर दाल)",
    mrp: 140,
    category: "Kirana (किराना)",
    subCategory: "Pulses & Grains",
    stock: 35,
    tags: ["dal", "toor", "pulse", "protein"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Moong Dal (मूंग दाल)",
    mrp: 130,
    category: "Kirana (किराना)",
    subCategory: "Pulses & Grains",
    stock: 40,
    tags: ["dal", "moong", "pulse", "healthy"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Masoor Dal (मसूर दाल)",
    mrp: 125,
    category: "Kirana (किराना)",
    subCategory: "Pulses & Grains",
    stock: 45,
    tags: ["dal", "masoor", "pulse", "nutritious"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Chana Dal (चना दाल)",
    mrp: 135,
    category: "Kirana (किराना)",
    subCategory: "Pulses & Grains",
    stock: 30,
    tags: ["dal", "chana", "pulse", "protein"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Urad Dal (उड़द दाल)",
    mrp: 145,
    category: "Kirana (किराना)",
    subCategory: "Pulses & Grains",
    stock: 25,
    tags: ["dal", "urad", "pulse", "traditional"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Wheat Flour (गेहूं का आटा)",
    mrp: 55,
    category: "Kirana (किराना)",
    subCategory: "Pulses & Grains",
    stock: 70,
    tags: ["wheat", "flour", "atta", "baking"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Besan (बेसन)",
    mrp: 65,
    category: "Kirana (किराना)",
    subCategory: "Pulses & Grains",
    stock: 35,
    tags: ["besan", "gram flour", "cooking", "pakora"],
    isActive: true,
    isAvailable: true
  },

  // Cooking Oil Category
  {
    name: "Sunflower Oil (सूरजमुखी तेल)",
    mrp: 140,
    category: "Kirana (किराना)",
    subCategory: "Cooking Oil",
    stock: 50,
    tags: ["oil", "sunflower", "cooking", "healthy"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Mustard Oil (सरसों का तेल)",
    mrp: 160,
    category: "Kirana (किराना)",
    subCategory: "Cooking Oil",
    stock: 40,
    tags: ["oil", "mustard", "traditional", "spicy"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Groundnut Oil (मूंगफली का तेल)",
    mrp: 150,
    category: "Kirana (किराना)",
    subCategory: "Cooking Oil",
    stock: 35,
    tags: ["oil", "groundnut", "peanut", "cooking"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Ghee (घी)",
    mrp: 550,
    category: "Kirana (किराना)",
    subCategory: "Cooking Oil",
    stock: 20,
    tags: ["ghee", "clarified butter", "traditional", "pure"],
    isActive: true,
    isAvailable: true
  },

  // Spices & Masalas Category
  {
    name: "Turmeric Powder (हल्दी पाउडर)",
    mrp: 45,
    category: "Kirana (किराना)",
    subCategory: "Spices & Masalas",
    stock: 60,
    tags: ["turmeric", "haldi", "spice", "cooking"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Red Chilli Powder (लाल मिर्च पाउडर)",
    mrp: 55,
    category: "Kirana (किराना)",
    subCategory: "Spices & Masalas",
    stock: 45,
    tags: ["chilli", "red chilli", "spice", "hot"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Coriander Powder (धनिया पाउडर)",
    mrp: 50,
    category: "Kirana (किराना)",
    subCategory: "Spices & Masalas",
    stock: 40,
    tags: ["coriander", "dhaniya", "spice", "cooking"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Cumin Seeds (जीरा)",
    mrp: 65,
    category: "Kirana (किराना)",
    subCategory: "Spices & Masalas",
    stock: 35,
    tags: ["cumin", "jeera", "spice", "tempering"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Mustard Seeds (सरसों के दाने)",
    mrp: 40,
    category: "Kirana (किराना)",
    subCategory: "Spices & Masalas",
    stock: 50,
    tags: ["mustard", "seeds", "spice", "tempering"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Black Pepper (काली मिर्च)",
    mrp: 75,
    category: "Kirana (किराना)",
    subCategory: "Spices & Masalas",
    stock: 30,
    tags: ["pepper", "black pepper", "spice", "seasoning"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Cardamom (इलायची)",
    mrp: 85,
    category: "Kirana (किराना)",
    subCategory: "Spices & Masalas",
    stock: 25,
    tags: ["cardamom", "elaichi", "spice", "aromatic"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Cinnamon (दालचीनी)",
    mrp: 70,
    category: "Kirana (किराना)",
    subCategory: "Spices & Masalas",
    stock: 30,
    tags: ["cinnamon", "dalchini", "spice", "sweet"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Garam Masala (गरम मसाला)",
    mrp: 60,
    category: "Kirana (किराना)",
    subCategory: "Spices & Masalas",
    stock: 40,
    tags: ["garam masala", "spice mix", "cooking", "traditional"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Kitchen King Masala (किचन किंग मसाला)",
    mrp: 55,
    category: "Kirana (किराना)",
    subCategory: "Spices & Masalas",
    stock: 35,
    tags: ["kitchen king", "masala", "cooking", "ready mix"],
    isActive: true,
    isAvailable: true
  },

  // Tea & Coffee Category
  {
    name: "Tea Bags (चाय के पैकेट)",
    mrp: 85,
    category: "Kirana (किराना)",
    subCategory: "Tea & Coffee",
    stock: 50,
    tags: ["tea", "bags", "beverage", "daily"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Loose Tea (खुली चाय)",
    mrp: 75,
    category: "Kirana (किराना)",
    subCategory: "Tea & Coffee",
    stock: 45,
    tags: ["tea", "loose", "beverage", "traditional"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Green Tea (हरी चाय)",
    mrp: 95,
    category: "Kirana (किराना)",
    subCategory: "Tea & Coffee",
    stock: 30,
    tags: ["tea", "green tea", "healthy", "antioxidant"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Coffee Powder (कॉफी पाउडर)",
    mrp: 110,
    category: "Kirana (किराना)",
    subCategory: "Tea & Coffee",
    stock: 25,
    tags: ["coffee", "powder", "beverage", "energy"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Instant Coffee (इंस्टेंट कॉफी)",
    mrp: 120,
    category: "Kirana (किराना)",
    subCategory: "Tea & Coffee",
    stock: 20,
    tags: ["coffee", "instant", "beverage", "quick"],
    isActive: true,
    isAvailable: true
  },

  // Snacks & Namkeen Category
  {
    name: "Roasted Peanuts (भुनी मूंगफली)",
    mrp: 90,
    category: "Kirana (किराना)",
    subCategory: "Snacks & Namkeen",
    stock: 40,
    tags: ["peanuts", "roasted", "snack", "protein"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Mixed Namkeen (मिक्स नमकीन)",
    mrp: 120,
    category: "Kirana (किराना)",
    subCategory: "Snacks & Namkeen",
    stock: 35,
    tags: ["namkeen", "mixed", "snack", "traditional"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Moong Dal Namkeen (मूंग दाल नमकीन)",
    mrp: 100,
    category: "Kirana (किराना)",
    subCategory: "Snacks & Namkeen",
    stock: 30,
    tags: ["namkeen", "moong dal", "snack", "crispy"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Aloo Bhujia (आलू भुजिया)",
    mrp: 85,
    category: "Kirana (किराना)",
    subCategory: "Snacks & Namkeen",
    stock: 45,
    tags: ["bhujia", "aloo", "snack", "crispy"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Kurkure (कुरकुरे)",
    mrp: 20,
    category: "Kirana (किराना)",
    subCategory: "Snacks & Namkeen",
    stock: 80,
    tags: ["kurkure", "chips", "snack", "kids"],
    isActive: true,
    isAvailable: true
  },

  // Beverages Category
  {
    name: "Coca Cola (कोका कोला)",
    mrp: 35,
    category: "Kirana (किराना)",
    subCategory: "Beverages",
    stock: 60,
    tags: ["cola", "soft drink", "beverage", "refreshing"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Sprite (स्प्राइट)",
    mrp: 35,
    category: "Kirana (किराना)",
    subCategory: "Beverages",
    stock: 55,
    tags: ["sprite", "soft drink", "beverage", "lemon"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Fanta (फैंटा)",
    mrp: 35,
    category: "Kirana (किराना)",
    subCategory: "Beverages",
    stock: 50,
    tags: ["fanta", "soft drink", "beverage", "orange"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Lemonade (नींबू पानी)",
    mrp: 25,
    category: "Kirana (किराना)",
    subCategory: "Beverages",
    stock: 40,
    tags: ["lemonade", "nimbu pani", "beverage", "refreshing"],
    isActive: true,
    isAvailable: true
  },

  // Personal Care Category
  {
    name: "Toothpaste (टूथपेस्ट)",
    mrp: 45,
    category: "Kirana (किराना)",
    subCategory: "Personal Care",
    stock: 50,
    tags: ["toothpaste", "dental", "hygiene", "care"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Soap (साबुन)",
    mrp: 25,
    category: "Kirana (किराना)",
    subCategory: "Personal Care",
    stock: 70,
    tags: ["soap", "bathing", "hygiene", "care"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Shampoo (शैम्पू)",
    mrp: 85,
    category: "Kirana (किराना)",
    subCategory: "Personal Care",
    stock: 35,
    tags: ["shampoo", "hair", "care", "bathing"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Hair Oil (बालों का तेल)",
    mrp: 65,
    category: "Kirana (किराना)",
    subCategory: "Personal Care",
    stock: 40,
    tags: ["hair oil", "hair care", "oil", "nourishment"],
    isActive: true,
    isAvailable: true
  },

  // Household Items Category
  {
    name: "Detergent Powder (डिटर्जेंट पाउडर)",
    mrp: 95,
    category: "Kirana (किराना)",
    subCategory: "Household Items",
    stock: 45,
    tags: ["detergent", "washing", "household", "cleaning"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Dish Soap (बर्तन धोने का साबुन)",
    mrp: 35,
    category: "Kirana (किराना)",
    subCategory: "Household Items",
    stock: 60,
    tags: ["dish soap", "utensils", "cleaning", "household"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Floor Cleaner (फर्श साफ करने का लिक्विड)",
    mrp: 75,
    category: "Kirana (किराना)",
    subCategory: "Household Items",
    stock: 30,
    tags: ["floor cleaner", "cleaning", "household", "liquid"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Toilet Cleaner (टॉयलेट क्लीनर)",
    mrp: 55,
    category: "Kirana (किराना)",
    subCategory: "Household Items",
    stock: 35,
    tags: ["toilet cleaner", "bathroom", "cleaning", "household"],
    isActive: true,
    isAvailable: true
  },

  // Baby Care Category
  {
    name: "Baby Diapers (बच्चों के डायपर)",
    mrp: 180,
    category: "Kirana (किराना)",
    subCategory: "Baby Care",
    stock: 25,
    tags: ["diapers", "baby", "care", "hygiene"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Baby Wipes (बच्चों के वाइप्स)",
    mrp: 120,
    category: "Kirana (किराना)",
    subCategory: "Baby Care",
    stock: 30,
    tags: ["baby wipes", "baby", "care", "cleaning"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Baby Soap (बच्चों का साबुन)",
    mrp: 45,
    category: "Kirana (किराना)",
    subCategory: "Baby Care",
    stock: 40,
    tags: ["baby soap", "baby", "care", "gentle"],
    isActive: true,
    isAvailable: true
  },

  // Stationery Category
  {
    name: "Notebook (नोटबुक)",
    mrp: 25,
    category: "Kirana (किराना)",
    subCategory: "Stationery",
    stock: 80,
    tags: ["notebook", "stationery", "writing", "school"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Pen (कलम)",
    mrp: 15,
    category: "Kirana (किराना)",
    subCategory: "Stationery",
    stock: 100,
    tags: ["pen", "stationery", "writing", "office"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Pencil (पेंसिल)",
    mrp: 8,
    category: "Kirana (किराना)",
    subCategory: "Stationery",
    stock: 120,
    tags: ["pencil", "stationery", "writing", "school"],
    isActive: true,
    isAvailable: true
  },
  {
    name: "Eraser (रबड़)",
    mrp: 5,
    category: "Kirana (किराना)",
    subCategory: "Stationery",
    stock: 90,
    tags: ["eraser", "stationery", "correction", "school"],
    isActive: true,
    isAvailable: true
  }
];

async function addKiranaProducts() {
  try {
    console.log('Starting to add kirana products...');
    
    for (const product of kiranaProducts) {
      // Add to products collection
      const productDoc = await addDoc(collection(db, "products"), {
        ...product,
        createdAt: serverTimestamp(),
      });
      
      // Add to product_lists collection
      await setDoc(doc(db, "product_lists", productDoc.id), {
        ...product,
        createdAt: serverTimestamp(),
      });
      
      console.log(`Added product: ${product.name}`);
    }
    
    console.log('Successfully added all kirana products!');
    console.log(`Total products added: ${kiranaProducts.length}`);
    
  } catch (error) {
    console.error('Error adding kirana products:', error);
  }
}

// Run the function
addKiranaProducts(); 