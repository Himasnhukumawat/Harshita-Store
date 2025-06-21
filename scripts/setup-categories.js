const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

const categories = [
  {
    name: "Saree",
    description: "Traditional Indian sarees in various styles and materials",
    subCategories: [
      { id: "1", name: "Silk Sarees", description: "Premium silk sarees" },
      { id: "2", name: "Cotton Sarees", description: "Comfortable cotton sarees" },
      { id: "3", name: "Georgette Sarees", description: "Elegant georgette sarees" },
      { id: "4", name: "Designer Sarees", description: "Exclusive designer collection" },
      { id: "5", name: "Bridal Sarees", description: "Special bridal sarees" }
    ]
  },
  {
    name: "Clothes",
    description: "Western and Indian clothing for all ages",
    subCategories: [
      { id: "1", name: "Kurtis", description: "Traditional kurtis" },
      { id: "2", name: "Salwar Kameez", description: "Complete salwar kameez sets" },
      { id: "3", name: "Dresses", description: "Western dresses" },
      { id: "4", name: "Tops", description: "Casual and party tops" },
      { id: "5", name: "Pants & Jeans", description: "Bottom wear" },
      { id: "6", name: "Kids Wear", description: "Clothing for children" }
    ]
  },
  {
    name: "Kirana",
    description: "Daily household grocery items",
    subCategories: [
      { id: "1", name: "Pulses & Grains", description: "Dal, rice, wheat, etc." },
      { id: "2", name: "Cooking Oil", description: "Various cooking oils" },
      { id: "3", name: "Spices & Masalas", description: "Whole and ground spices" },
      { id: "4", name: "Sugar & Salt", description: "Basic cooking essentials" },
      { id: "5", name: "Tea & Coffee", description: "Beverage items" },
      { id: "6", name: "Snacks", description: "Packaged snacks" },
      { id: "7", name: "Beverages", description: "Soft drinks and juices" },
      { id: "8", name: "Personal Care", description: "Soaps, shampoos, etc." }
    ]
  },
  {
    name: "Sleepers",
    description: "Comfortable footwear for home and casual wear",
    subCategories: [
      { id: "1", name: "Men's Sleepers", description: "Sleepers for men" },
      { id: "2", name: "Women's Sleepers", description: "Sleepers for women" },
      { id: "3", name: "Kids Sleepers", description: "Sleepers for children" },
      { id: "4", name: "Designer Sleepers", description: "Fashionable sleepers" },
      { id: "5", name: "Sports Sleepers", description: "Athletic footwear" }
    ]
  },
  {
    name: "Bangles",
    description: "Traditional and modern bangles for women",
    subCategories: [
      { id: "1", name: "Glass Bangles", description: "Traditional glass bangles" },
      { id: "2", name: "Metal Bangles", description: "Gold, silver, and other metals" },
      { id: "3", name: "Plastic Bangles", description: "Colorful plastic bangles" },
      { id: "4", name: "Designer Bangles", description: "Fashionable designer bangles" },
      { id: "5", name: "Bridal Bangles", description: "Special bridal collection" }
    ]
  },
  {
    name: "Pooja Items",
    description: "Religious and spiritual items for prayers",
    subCategories: [
      { id: "1", name: "Incense & Agarbatti", description: "Various types of incense" },
      { id: "2", name: "Diyas & Candles", description: "Oil lamps and candles" },
      { id: "3", name: "Idols & Pictures", description: "Religious idols and images" },
      { id: "4", name: "Pooja Thali", description: "Complete pooja sets" },
      { id: "5", name: "Kumkum & Chandan", description: "Religious powders" },
      { id: "6", name: "Flowers & Garlands", description: "Fresh and artificial flowers" }
    ]
  },
  {
    name: "Jewelry",
    description: "Traditional and modern jewelry pieces",
    subCategories: [
      { id: "1", name: "Necklaces", description: "Various necklaces and chains" },
      { id: "2", name: "Earrings", description: "Traditional and modern earrings" },
      { id: "3", name: "Rings", description: "Finger rings" },
      { id: "4", name: "Anklets", description: "Foot jewelry" },
      { id: "5", name: "Nose Pins", description: "Nose jewelry" },
      { id: "6", name: "Hair Accessories", description: "Hair clips and pins" }
    ]
  },
  {
    name: "Home & Kitchen",
    description: "Household and kitchen essentials",
    subCategories: [
      { id: "1", name: "Kitchen Utensils", description: "Cooking and serving utensils" },
      { id: "2", name: "Storage Containers", description: "Food storage solutions" },
      { id: "3", name: "Cleaning Supplies", description: "Household cleaning items" },
      { id: "4", name: "Bedding", description: "Bed sheets, pillows, etc." },
      { id: "5", name: "Bathroom Items", description: "Bathroom essentials" },
      { id: "6", name: "Home Decor", description: "Decorative items" }
    ]
  }
];

async function setupCategories() {
  console.log('🚀 Starting category setup...');
  
  for (const category of categories) {
    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: category.name,
        description: category.description,
        subCategories: category.subCategories,
        createdAt: serverTimestamp(),
      });
      console.log(`✅ Added category: ${category.name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Error adding category ${category.name}:`, error);
    }
  }
  
  console.log('🎉 Category setup completed!');
  process.exit(0);
}

setupCategories(); 