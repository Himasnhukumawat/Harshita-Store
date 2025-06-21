import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    console.log("Uploading file:", file.name, "Size:", file.size, "Type:", file.type)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create FormData for Cloudinary
    const cloudinaryFormData = new FormData()

    // Create a new File object from the buffer
    const cloudinaryFile = new File([buffer], file.name, { type: file.type })
    cloudinaryFormData.append("file", cloudinaryFile)
    cloudinaryFormData.append("upload_preset", "Himanshu") // Updated to your preset name
    cloudinaryFormData.append("cloud_name", "dm6jg48sp")
    cloudinaryFormData.append("folder", "shop-products")

    console.log("Sending to Cloudinary with preset: Himanshu")

    // Upload to Cloudinary with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(`https://api.cloudinary.com/v1_1/dm6jg48sp/image/upload`, {
      method: "POST",
      body: cloudinaryFormData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("Cloudinary response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Cloudinary error response:", errorText)

      // Try to parse error response
      let errorMessage = "Upload failed"
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error?.message || errorData.message || errorMessage
      } catch {
        errorMessage = `Upload failed with status ${response.status}`
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = await response.json()
    console.log("Upload successful:", data.secure_url)

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
    })
  } catch (error: any) {
    console.error("Upload error:", error)

    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Upload timeout. Please try again." }, { status: 408 })
    }

    return NextResponse.json(
      {
        error: error.message || "Image upload failed. Please try again.",
      },
      { status: 500 },
    )
  }
}
