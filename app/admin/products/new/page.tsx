"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, serverTimestamp, getDocs, setDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Category } from "@/lib/types"
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

export default function NewProductPage() {
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // Find selected category and reset sub-category when category changes
    const category = categories.find((cat) => cat.name === formData.category)
    setSelectedCategory(category || null)
    if (formData.subCategory && category && !category.subCategories?.find((sub) => sub.name === formData.subCategory)) {
      setFormData({ ...formData, subCategory: "" })
    }
  }, [formData.category, categories, setFormData, setSelectedCategory])

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
    setLoading(true)

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

      const imageUrl = uploadedImageUrl || ""

      // Add to products collection
      const productRef = await addDoc(collection(db, "products"), {
        name: formData.name,
        mrp: Number.parseFloat(formData.mrp),
        category: formData.category,
        subCategory: formData.subCategory || null,
        stock: Number.parseInt(formData.stock),
        imageUrl,
        tags: [],
        isActive: formData.isActive,
        isAvailable: formData.isAvailable,
        createdAt: serverTimestamp(),
      })

      // Also add to product_lists collection for tracking
      await setDoc(doc(db, "product_lists", productRef.id), {
        name: formData.name,
        mrp: Number.parseFloat(formData.mrp),
        category: formData.category,
        subCategory: formData.subCategory || null,
        isActive: formData.isActive,
        isAvailable: formData.isAvailable,
        createdAt: serverTimestamp(),
      })

      router.push("/admin/products")
    } catch (error: any) {
      console.error("Error creating product:", error)
      setError(error.message || "Failed to create product")
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold">Add Product</h1>
          <p className="text-muted-foreground">Create a new product for your shop</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Fill in the essential information for the new product</CardDescription>
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
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value, subCategory: "" })}
                  disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>

            <ImageUpload onImageChange={handleImageChange} label="Product Image" required />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  disabled={loading}
                />
                <Label htmlFor="isActive">Product is active and visible in admin panel</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                  disabled={loading}
                />
                <Label htmlFor="isAvailable">Product is available for customers</Label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading || (image && !uploadedImageUrl)}>
                {loading ? "Creating..." : "Create Product"}
              </Button>
              <Button type="button" variant="outline" asChild disabled={loading}>
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
