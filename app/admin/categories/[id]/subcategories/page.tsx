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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Edit, Save, Trash2, Tag } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function SubCategoriesPage() {
  const params = useParams()
  const categoryId = params.id as string
  const router = useRouter()

  const [category, setCategory] = useState<Category | null>(null)
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [newSubCategory, setNewSubCategory] = useState({ name: "", description: "" })
  const [editingSubCategory, setEditingSubCategory] = useState<string | null>(null)
  const [editSubCategoryData, setEditSubCategoryData] = useState({ name: "", description: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCategory()
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      const docRef = doc(db, "categories", categoryId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const categoryData = docSnap.data() as Category
        setCategory(categoryData)
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

  const saveChanges = async () => {
    if (!category) return
    
    setSaving(true)
    try {
      const docRef = doc(db, "categories", categoryId)
      await updateDoc(docRef, {
        subCategories,
      })
      
      // Show success message or redirect
      router.push("/admin/categories")
    } catch (error: any) {
      console.error("Error updating subcategories:", error)
      setError(error.message || "Failed to update subcategories")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading category details..." />
  }

  if (error && !category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manage Sub-Categories</h1>
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
            Back to Categories
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Manage Sub-Categories</h1>
          <p className="text-muted-foreground">
            Manage sub-categories for: <span className="font-semibold">{category?.name}</span>
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Category Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Category Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Category Name</Label>
              <p className="text-lg font-semibold">{category?.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Total Sub-Categories</Label>
              <Badge variant="outline" className="text-lg">
                {subCategories.length}
              </Badge>
            </div>
            {category?.description && (
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Sub-Category */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Sub-Category</CardTitle>
          <CardDescription>Create a new sub-category for this category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subCategoryName">Sub-Category Name *</Label>
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
            onClick={addSubCategory}
            className="mt-4"
            disabled={!newSubCategory.name.trim() || saving}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Sub-Category
          </Button>
        </CardContent>
      </Card>

      {/* Existing Sub-Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Current Sub-Categories</CardTitle>
          <CardDescription>
            Manage existing sub-categories. Click edit to modify or trash to remove.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subCategories.length > 0 ? (
            <div className="space-y-3">
              {subCategories.map((subCategory) => (
                <div
                  key={subCategory.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                >
                  {editingSubCategory === subCategory.id ? (
                    // Edit mode
                    <div className="flex-1 grid gap-3 md:grid-cols-2">
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
                      <h3 className="font-semibold text-lg">{subCategory.name}</h3>
                      {subCategory.description && (
                        <p className="text-muted-foreground">{subCategory.description}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {editingSubCategory === subCategory.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveSubCategoryEdit}
                          disabled={!editSubCategoryData.name.trim() || saving}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
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
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingSubCategory(subCategory)}
                          disabled={saving}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
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
          ) : (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sub-categories yet</h3>
              <p className="text-muted-foreground">Add your first sub-category above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/admin/categories">Cancel</Link>
        </Button>
        <Button onClick={saveChanges} disabled={saving}>
          {saving ? "Saving Changes..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  )
} 