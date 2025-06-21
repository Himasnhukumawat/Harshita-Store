import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore"

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCJ4JY0vjekg28It4y3v5pv-RWhVWzE6DU",
  authDomain: "harshitageneralstore-3d00d.firebaseapp.com",
  projectId: "harshitageneralstore-3d00d",
  storageBucket: "harshitageneralstore-3d00d.firebasestorage.app",
  messagingSenderId: "641816325196",
  appId: "1:641816325196:web:14c01e5b8445ac376ad8e9",
  measurementId: "G-0L46GS8PM3",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function makeSuperAdmin() {
  try {
    // Replace this with your actual Firebase Auth UID
    // You can find this in Firebase Console > Authentication > Users
    const YOUR_UID = "YOUR_FIREBASE_AUTH_UID_HERE"

    // Replace with your actual email and name
    const YOUR_EMAIL = "your-email@example.com"
    const YOUR_NAME = "Your Name"

    console.log("Adding super admin user...")

    await setDoc(doc(db, "admins", YOUR_UID), {
      email: YOUR_EMAIL,
      name: YOUR_NAME,
      role: "super_admin",
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy: "system",
    })

    console.log("✅ Successfully added super admin user!")
    console.log("User ID:", YOUR_UID)
    console.log("Email:", YOUR_EMAIL)
    console.log("Role: super_admin")
  } catch (error) {
    console.error("❌ Error adding super admin:", error)
  }
}

// Run the function
makeSuperAdmin()
