"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { SubCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { ImageUpload } from "@/components/image-upload"

export default function NewCategoryPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [newSubCategory, setNewSubCategory] = useState({ name: "", description: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleImageChange = (file: File | null, preview: string, uploadedUrl?: string) => {
    setImageFile(file)
    setImagePreview(preview)
    if (uploadedUrl) {
      setUploadedImageUrl(uploadedUrl)
    }
  }

  const addSubCategory = () => {
    if (newSubCategory.name.trim()) {
      const subCategory: SubCategory = {
        id: Date.now().toString(),
        name: newSubCategory.name.trim(),
        description: newSubCategory.description.trim(),
      }
      setSubCategories([...subCategories, subCategory])
      setNewSubCategory({ name: "", description: "" })
    }
  }

  const removeSubCategory = (id: string) => {
    setSubCategories(subCategories.filter((sub) => sub.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Use the uploaded image URL if available, otherwise empty string
      const imageUrl = uploadedImageUrl || ""

      await addDoc(collection(db, "categories"), {
        ...formData,
        imageUrl,
        subCategories,
        createdAt: serverTimestamp(),
      })

      router.push("/admin/categories")
    } catch (error: any) {
      console.error("Error creating category:", error)
      setError(error.message || "Failed to create category")
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold">Create Category</h1>
          <p className="text-muted-foreground">Add a new product category with sub-categories</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Fill in the information for the new category</CardDescription>
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <ImageUpload onImageChange={handleImageChange} label="Category Image (Optional)" />

            {/* Sub-categories Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Sub-Categories</Label>
                <p className="text-sm text-muted-foreground">Add sub-categories to organize products better</p>
              </div>

              {/* Add new sub-category */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="subCategoryName">Sub-Category Name</Label>
                      <Input
                        id="subCategoryName"
                        value={newSubCategory.name}
                        onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                        placeholder="e.g., Incense, Diyas, Idols"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subCategoryDescription">Description (Optional)</Label>
                      <Input
                        id="subCategoryDescription"
                        value={newSubCategory.description}
                        onChange={(e) => setNewSubCategory({ ...newSubCategory, description: e.target.value })}
                        placeholder="Brief description"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addSubCategory}
                    className="mt-4"
                    disabled={!newSubCategory.name.trim() || loading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sub-Category
                  </Button>
                </CardContent>
              </Card>

              {/* Display added sub-categories */}
              {subCategories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Added Sub-Categories ({subCategories.length})</Label>
                  <div className="grid gap-2">
                    {subCategories.map((subCategory) => (
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubCategory(subCategory.id)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading || (imageFile && !uploadedImageUrl)}>
                {loading ? "Creating..." : "Create Category"}
              </Button>
              <Button type="button" variant="outline" asChild disabled={loading}>
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
