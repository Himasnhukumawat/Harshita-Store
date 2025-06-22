import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"
import type { StoreSettings } from "./types"

const STORE_SETTINGS_DOC_ID = "store_settings"

export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    const docRef = doc(db, "store_settings", STORE_SETTINGS_DOC_ID)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as StoreSettings
    }
    
    return null
  } catch (error) {
    console.error("Error fetching store settings:", error)
    throw new Error("Failed to fetch store settings")
  }
}

export async function createStoreSettings(settings: Partial<StoreSettings>, userId: string): Promise<void> {
  try {
    const docRef = doc(db, "store_settings", STORE_SETTINGS_DOC_ID)
    await setDoc(docRef, {
      ...settings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })
  } catch (error) {
    console.error("Error creating store settings:", error)
    throw new Error("Failed to create store settings")
  }
}

export async function updateStoreSettings(settings: Partial<StoreSettings>, userId: string): Promise<void> {
  try {
    const docRef = doc(db, "store_settings", STORE_SETTINGS_DOC_ID)
    await updateDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })
  } catch (error) {
    console.error("Error updating store settings:", error)
    throw new Error("Failed to update store settings")
  }
}

export async function initializeStoreSettings(userId: string): Promise<void> {
  try {
    const existingSettings = await getStoreSettings()
    if (!existingSettings) {
      const defaultSettings: Partial<StoreSettings> = {
        storeName: "",
        storeNameHindi: "",
        tagline: "",
        taglineHindi: "",
        description: "",
        descriptionHindi: "",
        freePickup: false,
        cashOnPickup: false,
        onlineOrdering: false,
        primaryPhone: "",
        secondaryPhone: "",
        whatsappNumber: "",
        email: "",
        website: "",
        gstNumber: "",
        licenseNumber: "",
        establishedYear: new Date().getFullYear(),
        address: "",
        addressHindi: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        mondayToSaturday: "",
        sunday: "",
        holidayHours: "",
        facebook: "",
        instagram: "",
        twitter: "",
        metaTitle: "",
        metaDescription: "",
        keywords: [],
      }
      await createStoreSettings(defaultSettings, userId)
    }
  } catch (error) {
    console.error("Error initializing store settings:", error)
    throw new Error("Failed to initialize store settings")
  }
} 