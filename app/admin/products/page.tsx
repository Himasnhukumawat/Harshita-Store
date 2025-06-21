"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Plus, Search, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.isActive) ||
        (statusFilter === "inactive" && !product.isActive)

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && product.isAvailable) ||
        (availabilityFilter === "unavailable" && !product.isAvailable)

      return matchesSearch && matchesStatus && matchesAvailability
    })
    setFilteredProducts(filtered)
  }, [products, searchTerm, statusFilter, availabilityFilter])

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"))
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isAvailable: doc.data().isAvailable ?? true, // Default to true if not set
      })) as Product[]

      const sortedProducts = productsData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return b.createdAt.toMillis() - a.createdAt.toMillis()
      })

      setProducts(sortedProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "products", id))
        await deleteDoc(doc(db, "product_lists", id))
        setProducts(products.filter((product) => product.id !== id))
      } catch (error) {
        console.error("Error deleting product:", error)
        setError("Failed to delete product")
      }
    }
  }

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "products", id), {
        isActive: !currentStatus,
      })
      await updateDoc(doc(db, "product_lists", id), {
        isActive: !currentStatus,
      })
      setProducts(products.map((product) => (product.id === id ? { ...product, isActive: !currentStatus } : product)))
    } catch (error) {
      console.error("Error updating product status:", error)
      setError("Failed to update product status")
    }
  }

  const toggleProductAvailability = async (id: string, currentAvailability: boolean) => {
    try {
      await updateDoc(doc(db, "products", id), {
        isAvailable: !currentAvailability,
      })
      await updateDoc(doc(db, "product_lists", id), {
        isAvailable: !currentAvailability,
      })
      setProducts(
        products.map((product) => (product.id === id ? { ...product, isAvailable: !currentAvailability } : product)),
      )
    } catch (error) {
      console.error("Error updating product availability:", error)
      setError("Failed to update product availability")
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading products..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your shop products</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Availability</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="outline">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                {product.imageUrl && (
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4 overflow-hidden">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                <CardDescription>Category: {product.category}</CardDescription>
                {product.subCategory && <CardDescription>Sub-Category: {product.subCategory}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold">₹{product.mrp}</p>
                    <p className="text-sm text-muted-foreground">MRP</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.stock > 5 ? "default" : "destructive"}>Stock: {product.stock}</Badge>
                    {product.stock <= 5 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{product.category}</Badge>
                  {!product.isActive && <Badge variant="destructive">Inactive</Badge>}
                  {product.isAvailable ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                      <XCircle className="w-3 h-3 mr-1" />
                      Unavailable
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <Switch
                      checked={product.isActive}
                      onCheckedChange={() => toggleProductStatus(product.id, product.isActive)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Available</span>
                    <Switch
                      checked={product.isAvailable}
                      onCheckedChange={() => toggleProductAvailability(product.id, product.isAvailable)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {product.createdAt ? new Date(product.createdAt.toDate()).toLocaleDateString() : "No date"}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id, product.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{searchTerm ? "No products found" : "No products yet"}</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Add your first product to get started"}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
