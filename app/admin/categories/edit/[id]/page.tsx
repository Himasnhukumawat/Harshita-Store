"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ImageUpload } from "@/components/image-upload"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function EditCategoryPage() {
  const params = useParams()
  const categoryId = params.id as string
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)

  useEffect(() => {
    fetchCategory()
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      const docRef = doc(db, "categories", categoryId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const categoryData = docSnap.data() as Category
        setFormData({
          name: categoryData.name,
          description: categoryData.description || "",
        })
        setCurrentImageUrl(categoryData.imageUrl || "")
        setUploadedImageUrl(categoryData.imageUrl || "")
        setCurrentCategory(categoryData)
      } else {
        setError("Category not found")
      }
    } catch (error) {
      console.error("Error fetching category:", error)
      setError("Failed to fetch category details")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (file: File | null, preview: string, uploadedUrl?: string) => {
    setImageFile(file)
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
      // Use uploaded image URL if new image was uploaded, otherwise keep current image
      const imageUrl = uploadedImageUrl || currentImageUrl

      const docRef = doc(db, "categories", categoryId)
      await updateDoc(docRef, {
        name: formData.name,
        description: formData.description,
        imageUrl,
        // Keep existing createdAt
      })

      router.push("/admin/categories")
    } catch (error: any) {
      console.error("Error updating category:", error)
      setError(error.message || "Failed to update category")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading category details..." />
  }

  if (error && !formData.name) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Category</h1>
            <p className="text-muted-foreground">Category not found</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Category</h1>
          <p className="text-muted-foreground">Update category information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Update the category information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pooja Items, Clothing, Kirana"
                required
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the category"
                rows={3}
                disabled={saving}
              />
            </div>

            <ImageUpload
              onImageChange={handleImageChange}
              currentImage={currentImageUrl}
              label="Category Image (Optional)"
            />

            {/* Sub-categories Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Sub-Categories</Label>
                <p className="text-sm text-muted-foreground">Manage sub-categories for this category</p>
              </div>

              {/* Display existing sub-categories */}
              {currentCategory?.subCategories && currentCategory.subCategories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Current Sub-Categories ({currentCategory.subCategories.length})
                  </Label>
                  <div className="grid gap-2">
                    {currentCategory.subCategories.map((subCategory) => (
                      <div
                        key={subCategory.id}
                        className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{subCategory.name}</p>
                          {subCategory.description && (
                            <p className="text-sm text-muted-foreground">{subCategory.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={saving || (imageFile && !uploadedImageUrl)}>
                {saving ? "Updating..." : "Update Category"}
              </Button>
              <Button type="button" variant="outline" asChild disabled={saving}>
                <Link href="/admin/categories">Cancel</Link>
              </Button>
            </div>

            {imageFile && !uploadedImageUrl && (
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
