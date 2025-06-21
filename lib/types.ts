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
