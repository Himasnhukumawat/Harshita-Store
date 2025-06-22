"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Category, SubCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, X, Edit, Save, Trash2 } from "lucide-react"
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
  
  // Subcategory management states
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [newSubCategory, setNewSubCategory] = useState({ name: "", description: "" })
  const [editingSubCategory, setEditingSubCategory] = useState<string | null>(null)
  const [editSubCategoryData, setEditSubCategoryData] = useState({ name: "", description: "" })

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
        setSubCategories(categoryData.subCategories || [])
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

  // Subcategory management functions
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

  const startEditingSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory.id)
    setEditSubCategoryData({
      name: subCategory.name,
      description: subCategory.description || "",
    })
  }

  const saveSubCategoryEdit = () => {
    if (editSubCategoryData.name.trim() && editingSubCategory) {
      setSubCategories(
        subCategories.map((sub) =>
          sub.id === editingSubCategory
            ? {
                ...sub,
                name: editSubCategoryData.name.trim(),
                description: editSubCategoryData.description.trim(),
              }
            : sub
        )
      )
      setEditingSubCategory(null)
      setEditSubCategoryData({ name: "", description: "" })
    }
  }

  const cancelSubCategoryEdit = () => {
    setEditingSubCategory(null)
    setEditSubCategoryData({ name: "", description: "" })
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
        subCategories, // Update subcategories
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
          <p className="text-muted-foreground">Update category information and manage sub-categories</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Update the category information and manage sub-categories</CardDescription>
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
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subCategoryDescription">Description (Optional)</Label>
                      <Input
                        id="subCategoryDescription"
                        value={newSubCategory.description}
                        onChange={(e) => setNewSubCategory({ ...newSubCategory, description: e.target.value })}
                        placeholder="Brief description"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addSubCategory}
                    className="mt-4"
                    disabled={!newSubCategory.name.trim() || saving}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sub-Category
                  </Button>
                </CardContent>
              </Card>

              {/* Display existing sub-categories */}
              {subCategories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Current Sub-Categories ({subCategories.length})
                  </Label>
                  <div className="grid gap-2">
                    {subCategories.map((subCategory) => (
                      <div
                        key={subCategory.id}
                        className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
                      >
                        {editingSubCategory === subCategory.id ? (
                          // Edit mode
                          <div className="flex-1 grid gap-2 md:grid-cols-2">
                            <Input
                              value={editSubCategoryData.name}
                              onChange={(e) => setEditSubCategoryData({ ...editSubCategoryData, name: e.target.value })}
                              placeholder="Sub-category name"
                            />
                            <Input
                              value={editSubCategoryData.description}
                              onChange={(e) => setEditSubCategoryData({ ...editSubCategoryData, description: e.target.value })}
                              placeholder="Description (optional)"
                            />
                          </div>
                        ) : (
                          // Display mode
                          <div className="flex-1">
                            <p className="font-medium">{subCategory.name}</p>
                            {subCategory.description && (
                              <p className="text-sm text-muted-foreground">{subCategory.description}</p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          {editingSubCategory === subCategory.id ? (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={saveSubCategoryEdit}
                                disabled={!editSubCategoryData.name.trim() || saving}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={cancelSubCategoryEdit}
                                disabled={saving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditingSubCategory(subCategory)}
                                disabled={saving}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSubCategory(subCategory.id)}
                                disabled={saving}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
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
