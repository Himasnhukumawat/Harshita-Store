"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Filter } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, stockFilter, categoryFilter])

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"))
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]

      const sortedProducts = productsData.sort((a, b) => a.stock - b.stock)
      setProducts(sortedProducts)

      // Extract unique categories
      const uniqueCategories = [...new Set(productsData.map((product) => product.category))].filter(Boolean)
      setCategories(uniqueCategories)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to fetch inventory data")
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "low") filtered = filtered.filter((product) => product.stock <= 5)
      if (stockFilter === "out") filtered = filtered.filter((product) => product.stock === 0)
      if (stockFilter === "good") filtered = filtered.filter((product) => product.stock > 5)
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter)
    }

    setFilteredProducts(filtered)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const, icon: AlertTriangle }
    if (stock <= 5) return { label: "Low Stock", variant: "secondary" as const, icon: TrendingDown }
    return { label: "In Stock", variant: "default" as const, icon: TrendingUp }
  }

  const inventoryStats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock <= 5 && p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    totalValue: products.reduce((sum, product) => sum + product.mrp * product.stock, 0),
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading inventory..." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Monitor stock levels and inventory value</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Inventory Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inventoryStats.lowStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{inventoryStats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="good">{"Good Stock (>5)"}</SelectItem>
                <SelectItem value="low">{"Low Stock (≤5)"}</SelectItem>
                <SelectItem value="out">Out of Stock (0)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="outline" className="flex items-center justify-center">
              {filteredProducts.length} products
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      {filteredProducts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Details</CardTitle>
            <CardDescription>Current stock levels for all products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Product</th>
                    <th className="text-left p-2 font-medium">Category</th>
                    <th className="text-left p-2 font-medium">MRP</th>
                    <th className="text-left p-2 font-medium">Stock</th>
                    <th className="text-left p-2 font-medium">Value</th>
                    <th className="text-left p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock)
                    const StockIcon = stockStatus.icon
                    return (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-3">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl || "/placeholder.svg"}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.subCategory && (
                                <p className="text-xs text-muted-foreground">{product.subCategory}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">{product.category}</td>
                        <td className="p-2 font-semibold">₹{product.mrp}</td>
                        <td className="p-2">
                          <span className={`font-bold ${product.stock <= 5 ? "text-red-600" : "text-green-600"}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-2 font-semibold text-green-600">
                          ₹{(product.mrp * product.stock).toLocaleString()}
                        </td>
                        <td className="p-2">
                          <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit">
                            <StockIcon className="h-3 w-3" />
                            {stockStatus.label}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
