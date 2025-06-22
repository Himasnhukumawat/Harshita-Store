const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

// Additional subcategories for different categories
const additionalSubcategories = {
  "Kirana (किराना)": [
    { name: "Biscuits & Cookies", description: "Packaged biscuits and cookies" },
    { name: "Chocolates & Candies", description: "Chocolates, candies, and sweets" },
    { name: "Noodles & Pasta", description: "Instant noodles and pasta products" },
    { name: "Sauces & Pickles", description: "Sauces, pickles, and condiments" },
    { name: "Beverages & Juices", description: "Soft drinks, juices, and beverages" },
    { name: "Frozen Foods", description: "Frozen vegetables and ready-to-cook items" },
    { name: "Baking Essentials", description: "Baking powder, yeast, and baking items" },
    { name: "Organic Products", description: "Organic food items and products" }
  ],
  "Saree": [
    { name: "Silk Sarees", description: "Pure silk and silk blend sarees" },
    { name: "Cotton Sarees", description: "Cotton and handloom sarees" },
    { name: "Designer Sarees", description: "Designer and party wear sarees" },
    { name: "Bridal Sarees", description: "Bridal and wedding sarees" },
    { name: "Georgette Sarees", description: "Georgette and chiffon sarees" },
    { name: "Crepe Sarees", description: "Crepe and synthetic sarees" },
    { name: "Embroidered Sarees", description: "Embroidered and embellished sarees" },
    { name: "Traditional Sarees", description: "Traditional and ethnic sarees" }
  ],
  "Clothes": [
    { name: "Kurtis", description: "Women's kurtis and tops" },
    { name: "Salwar Kameez", description: "Salwar kameez sets" },
    { name: "Kids Wear", description: "Clothing for children" },
    { name: "Men's Wear", description: "Traditional men's clothing" },
    { name: "Western Wear", description: "Western style clothing" },
    { name: "Ethnic Wear", description: "Ethnic and traditional clothing" },
    { name: "Casual Wear", description: "Casual and daily wear clothes" },
    { name: "Party Wear", description: "Party and occasion wear" }
  ],
  "Sleepers": [
    { name: "Men's Sleepers", description: "Sleepers for men" },
    { name: "Women's Sleepers", description: "Sleepers for women" },
    { name: "Kids Sleepers", description: "Sleepers for children" },
    { name: "Designer Sleepers", description: "Designer and fashionable sleepers" },
    { name: "Comfort Sleepers", description: "Comfortable and casual sleepers" },
    { name: "Party Sleepers", description: "Party and formal sleepers" },
    { name: "Sports Sleepers", description: "Sports and athletic sleepers" },
    { name: "Traditional Sleepers", description: "Traditional and ethnic sleepers" }
  ],
  "Bangles": [
    { name: "Glass Bangles", description: "Glass and colorful bangles" },
    { name: "Metal Bangles", description: "Metal and silver bangles" },
    { name: "Plastic Bangles", description: "Plastic and affordable bangles" },
    { name: "Designer Bangles", description: "Designer and fashionable bangles" },
    { name: "Traditional Bangles", description: "Traditional and ethnic bangles" },
    { name: "Bridal Bangles", description: "Bridal and wedding bangles" },
    { name: "Kids Bangles", description: "Bangles for children" },
    { name: "Antique Bangles", description: "Antique and vintage bangles" }
  ],
  "Pooja Items": [
    { name: "Incense & Agarbatti", description: "Incense sticks and agarbatti" },
    { name: "Diyas & Lamps", description: "Diyas, lamps, and lighting items" },
    { name: "Idols & Statues", description: "Religious idols and statues" },
    { name: "Pooja Thali", description: "Pooja thali and accessories" },
    { name: "Camphor & Kapur", description: "Camphor and kapur items" },
    { name: "Sacred Threads", description: "Sacred threads and mauli" },
    { name: "Pooja Books", description: "Religious books and scriptures" },
    { name: "Temple Items", description: "Temple and religious items" }
  ]
};

async function addSubcategoriesToCategories() {
  try {
    console.log('Fetching existing categories...');
    
    // Get all categories
    const querySnapshot = await getDocs(collection(db, "categories"));
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${categories.length} categories`);

    for (const category of categories) {
      const categoryName = category.name;
      const additionalSubs = additionalSubcategories[categoryName];
      
      if (additionalSubs) {
        console.log(`\nProcessing category: ${categoryName}`);
        
        // Get existing subcategories
        const existingSubs = category.subCategories || [];
        const existingSubNames = existingSubs.map(sub => sub.name);
        
        // Filter out subcategories that already exist
        const newSubs = additionalSubs.filter(sub => 
          !existingSubNames.includes(sub.name)
        );
        
        if (newSubs.length > 0) {
          // Create new subcategory objects with IDs
          const newSubCategories = newSubs.map(sub => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: sub.name,
            description: sub.description
          }));
          
          // Combine existing and new subcategories
          const updatedSubCategories = [...existingSubs, ...newSubCategories];
          
          // Update the category
          const docRef = doc(db, "categories", category.id);
          await updateDoc(docRef, {
            subCategories: updatedSubCategories
          });
          
          console.log(`Added ${newSubs.length} new subcategories to ${categoryName}:`);
          newSubs.forEach(sub => console.log(`  - ${sub.name}`));
        } else {
          console.log(`No new subcategories to add for ${categoryName}`);
        }
      }
    }
    
    console.log('\n✅ Successfully updated categories with new subcategories!');
    
  } catch (error) {
    console.error('Error adding subcategories:', error);
  }
}

// Run the function
addSubcategoriesToCategories(); 