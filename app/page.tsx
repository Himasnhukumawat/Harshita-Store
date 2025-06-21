"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/admin")
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading application..." />
  }

  return null
}
