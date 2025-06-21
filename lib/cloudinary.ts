export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)

  try {
    console.log("Starting upload for file:", file.name)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    console.log("Upload response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Upload error response:", errorData)
      throw new Error(errorData.error || `Upload failed with status ${response.status}`)
    }

    const data = await response.json()
    console.log("Upload successful:", data.url)

    if (!data.success || !data.url) {
      throw new Error("Invalid response from upload service")
    }

    return data.url
  } catch (error: any) {
    console.error("Error in uploadToCloudinary:", error)

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection and try again.")
    }

    throw new Error(error.message || "Image upload failed. Please try again.")
  }
}
