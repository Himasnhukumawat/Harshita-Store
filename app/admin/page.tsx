"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DashboardStats } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tag, Users, AlertTriangle, CheckCircle, Edit, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalAdmins: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    recentProducts: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get all products and calculate stats in memory to avoid complex queries
      const productsSnapshot = await getDocs(collection(db, "products"))
      const allProducts = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Calculate stats from the products array
      const totalProducts = allProducts.length
      const activeProducts = allProducts.filter((product: any) => product.isActive === true).length
      const lowStockProducts = allProducts.filter(
        (product: any) => product.isActive === true && product.stock <= 5,
      ).length

      // Get recent products (sort by createdAt in memory)
      const recentProducts = allProducts
        .sort((a: any, b: any) => {
          if (!a.createdAt || !b.createdAt) return 0
          return b.createdAt.toMillis() - a.createdAt.toMillis()
        })
        .slice(0, 5)

      // Get total categories
      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      const totalCategories = categoriesSnapshot.size

      // Get total admin users
      const adminsSnapshot = await getDocs(collection(db, "admins"))
      const totalAdmins = adminsSnapshot.size

      setStats({
        totalProducts,
        totalCategories,
        totalAdmins,
        activeProducts,
        lowStockProducts,
        recentProducts,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchStats}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your shop admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{stats.activeProducts} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdmins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Products with stock ≤ 5</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your shop efficiently</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button asChild size="lg">
            <Link href="/admin/products/new">
              <Package className="mr-2 h-5 w-5" />
              Add New Product
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/admin/categories/new">
              <Tag className="mr-2 h-5 w-5" />
              Create Category
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/admin/users/new">
              <Users className="mr-2 h-5 w-5" />
              Add Admin User
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Products - Enhanced UI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Products
          </CardTitle>
          <CardDescription>Latest products added to your shop</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.recentProducts.map((product: any) => (
                <Card
                  key={product.id}
                  className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>

                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-bold text-green-600">₹{product.mrp}</span>
                                <span className="text-xs text-muted-foreground">MRP</span>
                              </div>

                              <Badge variant={product.stock > 5 ? "default" : "destructive"} className="text-xs">
                                Stock: {product.stock}
                              </Badge>

                              {product.isActive ? (
                                <Badge
                                  variant="default"
                                  className="text-xs bg-green-100 text-green-800 hover:bg-green-100"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}

                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {product.createdAt
                                  ? new Date(product.createdAt.toDate()).toLocaleDateString()
                                  : "No date"}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button size="sm" variant="outline" asChild className="ml-4 shrink-0">
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* View All Products Link */}
              <div className="pt-4 border-t">
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/admin/products">View All Products ({stats.totalProducts})</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products added yet</h3>
              <p className="text-muted-foreground mb-6">Start building your inventory by adding your first product</p>
              <Button asChild size="lg">
                <Link href="/admin/products/new">
                  <Package className="mr-2 h-5 w-5" />
                  Add Your First Product
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
