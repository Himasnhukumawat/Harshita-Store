"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Category, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ImageUpload } from "@/components/image-upload"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    mrp: "",
    category: "",
    subCategory: "",
    stock: "",
    isActive: true,
    isAvailable: true,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProduct()
    fetchCategories()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, "products", productId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const productData = docSnap.data() as Product
        setFormData({
          name: productData.name,
          mrp: productData.mrp.toString(),
          category: productData.category,
          subCategory: productData.subCategory || "",
          stock: productData.stock.toString(),
          isActive: productData.isActive,
          isAvailable: productData.isAvailable ?? true, // Default to true if not set
        })
        setCurrentImageUrl(productData.imageUrl || "")
        setUploadedImageUrl(productData.imageUrl || "")
      } else {
        setError("Product not found")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setError("Failed to fetch product details")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"))
      const categoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        imageUrl: doc.data().imageUrl,
        subCategories: doc.data().subCategories || [],
        createdAt: doc.data().createdAt,
      }))
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleImageChange = (file: File | null, preview: string, uploadedUrl?: string) => {
    setImage(file)
    setImagePreview(preview)
    if (uploadedUrl) {
      setUploadedImageUrl(uploadedUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      // Validation
      if (Number.parseFloat(formData.mrp) <= 0) {
        throw new Error("MRP must be greater than 0")
      }
      if (Number.parseInt(formData.stock) < 0) {
        throw new Error("Stock cannot be negative")
      }
      if (!formData.category) {
        throw new Error("Please select a category")
      }

      // Use uploaded image URL if new image was uploaded, otherwise keep current image
      const imageUrl = uploadedImageUrl || currentImageUrl

      const docRef = doc(db, "products", productId)
      await updateDoc(docRef, {
        name: formData.name,
        mrp: Number.parseFloat(formData.mrp),
        category: formData.category,
        subCategory: formData.subCategory || null,
        stock: Number.parseInt(formData.stock),
        imageUrl,
        isActive: formData.isActive,
        isAvailable: formData.isAvailable,
        // Keep existing tags and createdAt
      })

      // Also update product_lists collection
      const productListRef = doc(db, "product_lists", productId)
      await updateDoc(productListRef, {
        name: formData.name,
        mrp: Number.parseFloat(formData.mrp),
        category: formData.category,
        subCategory: formData.subCategory || null,
        isActive: formData.isActive,
        isAvailable: formData.isAvailable,
      })

      router.push("/admin/products")
    } catch (error: any) {
      console.error("Error updating product:", error)
      setError(error.message || "Failed to update product")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading product details..." />
  }

  if (error && !formData.name) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">Product not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedCategory = categories.find((cat) => cat.name === formData.category)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Update the product information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value, subCategory: "" })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && selectedCategory.subCategories && selectedCategory.subCategories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subCategory">Sub-Category</Label>
                  <Select
                    value={formData.subCategory}
                    onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.subCategories.map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.name}>
                          {subCategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="mrp">MRP (₹) *</Label>
                <Input
                  id="mrp"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  placeholder="0.00"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <ImageUpload onImageChange={handleImageChange} currentImage={currentImageUrl} label="Product Image" />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  disabled={saving}
                />
                <Label htmlFor="isActive">Product is active and visible in admin panel</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                  disabled={saving}
                />
                <Label htmlFor="isAvailable">Product is available for customers</Label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={saving || (image && !uploadedImageUrl)}>
                {saving ? "Updating..." : "Update Product"}
              </Button>
              <Button type="button" variant="outline" asChild disabled={saving}>
                <Link href="/admin/products">Cancel</Link>
              </Button>
            </div>

            {image && !uploadedImageUrl && (
              <p className="text-sm text-muted-foreground">
                Please wait for the image to finish uploading before submitting.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
