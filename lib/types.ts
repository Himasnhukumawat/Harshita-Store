export interface Category {
  id: string
  name: string
  description: string
  imageUrl?: string
  subCategories?: SubCategory[]
  createdAt: any
}

export interface SubCategory {
  id: string
  name: string
  description?: string
}

export interface Product {
  id: string
  name: string
  mrp: number
  category: string
  subCategory?: string
  stock: number
  imageUrl?: string
  tags: string[]
  isActive: boolean
  isAvailable: boolean // New field for availability
  createdAt: any
}

export interface ProductList {
  id: string
  name: string
  mrp: number
  category: string
  subCategory?: string
  isActive: boolean
  isAvailable: boolean // New field for availability
  createdAt: any
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "super_admin"
  isActive: boolean
  createdAt: any
  createdBy: string
}

export interface AppSettings {
  id: string
  showSignUp: boolean
  updatedAt: any
  updatedBy: string
}

export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalAdmins: number
  activeProducts: number
  lowStockProducts: number
  recentProducts: Product[]
}

export interface StoreSettings {
  id?: string
  // Basic Information
  storeName: string
  storeNameHindi: string
  tagline: string
  taglineHindi: string
  description: string
  descriptionHindi: string
  
  // Store Features
  freePickup: boolean
  cashOnPickup: boolean
  onlineOrdering: boolean
  
  // Contact Information
  primaryPhone: string
  secondaryPhone: string
  whatsappNumber: string
  email: string
  website: string
  
  // Business Information
  gstNumber: string
  licenseNumber: string
  establishedYear: number
  
  // Address Information
  address: string
  addressHindi: string
  city: string
  state: string
  pincode: string
  landmark: string
  
  // Store Hours
  mondayToSaturday: string
  sunday: string
  holidayHours: string
  
  // Social Media
  facebook: string
  instagram: string
  twitter: string
  
  // SEO Settings
  metaTitle: string
  metaDescription: string
  keywords: string[]
  
  // Metadata
  createdAt?: any
  updatedAt?: any
  updatedBy?: string
}
