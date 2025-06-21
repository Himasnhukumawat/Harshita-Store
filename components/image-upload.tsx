"use client"

import type React from "react"
import { useState } from "react"
import { Upload, X, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageUploadProps {
  onImageChange: (file: File | null, preview: string, uploadedUrl?: string) => void
  currentImage?: string
  label?: string
  required?: boolean
}

export function ImageUpload({ onImageChange, currentImage, label = "Image", required = false }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImage || "")
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedUrl, setUploadedUrl] = useState<string>(currentImage || "")

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setPreview("")
      setUploadedUrl("")
      setError("")
      onImageChange(null, "", "")
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, GIF, etc.)")
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB")
      return
    }

    setError("")
    setUploading(true)

    try {
      // Create preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        const previewUrl = reader.result as string
        setPreview(previewUrl)
      }
      reader.readAsDataURL(file)

      // Upload to server
      console.log("Starting upload process...")
      const uploadedImageUrl = await uploadToCloudinary(file)
      console.log("Upload completed:", uploadedImageUrl)

      setUploadedUrl(uploadedImageUrl)

      // Pass both file and uploaded URL to parent
      onImageChange(file, preview, uploadedImageUrl)
    } catch (error: any) {
      console.error("Upload failed:", error)
      setError(error.message || "Failed to upload image. Please try again.")
      setPreview("")
      setUploadedUrl("")
    } finally {
      setUploading(false)
    }
  }

  // Upload function with better error handling
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    console.log("Uploading to /api/upload...")

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Upload error:", errorData)
      throw new Error(errorData.error || `Upload failed with status ${response.status}`)
    }

    const data = await response.json()
    console.log("Upload response:", data)

    if (!data.success || !data.url) {
      throw new Error("Invalid response from upload service")
    }

    return data.url
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFileChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleFileChange(file)
    } else {
      setError("Please drop a valid image file")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = () => {
    setPreview("")
    setUploadedUrl("")
    setError("")
    onImageChange(null, "", "")
  }

  const retryUpload = () => {
    setError("")
    // Re-trigger file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput && fileInput.files && fileInput.files[0]) {
      handleFileChange(fileInput.files[0])
    }
  }

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={retryUpload} className="ml-2">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {preview ? (
        <div className="relative">
          <img
            src={preview || "/placeholder.svg"}
            alt="Preview"
            className="w-full max-w-md h-48 object-cover rounded-md border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </Button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
              <div className="text-white text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Uploading to Cloudinary...</p>
              </div>
            </div>
          )}
          {uploadedUrl && !uploading && (
            <div className="absolute bottom-2 left-2">
              <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">✓ Uploaded Successfully</div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Uploading to Cloudinary...</p>
              <p className="text-xs text-muted-foreground mt-1">Using preset: Himanshu</p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop an image here, or click to select</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="max-w-xs mx-auto"
                required={required && !preview && !uploadedUrl}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-2">Supported: JPG, PNG, GIF, WebP • Max size: 10MB</p>
              <p className="text-xs text-muted-foreground">Cloudinary preset: Himanshu</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
