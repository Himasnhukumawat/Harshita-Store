import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCJ4JY0vjekg28It4y3v5pv-RWhVWzE6DU",
  authDomain: "harshitageneralstore-3d00d.firebaseapp.com",
  projectId: "harshitageneralstore-3d00d",
  storageBucket: "harshitageneralstore-3d00d.firebasestorage.app",
  messagingSenderId: "641816325196",
  appId: "1:641816325196:web:14c01e5b8445ac376ad8e9",
  measurementId: "G-0L46GS8PM3",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
