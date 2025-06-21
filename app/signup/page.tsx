"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function SignUpPage() {
  const [showSignUp, setShowSignUp] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  useEffect(() => {
    checkSignUpSettings()
  }, [])

  const checkSignUpSettings = async () => {
    try {
      const docRef = doc(db, "settings", "app_settings")
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setShowSignUp(docSnap.data().showSignUp || false)
      } else {
        setShowSignUp(true) // Default to true if settings don't exist
      }
    } catch (error) {
      console.error("Error checking settings:", error)
      setShowSignUp(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate form submission (you can integrate with email service or store requests in Firebase)
    setTimeout(() => {
      setSuccess(true)
      setSubmitting(false)
    }, 2000)
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading..." />
  }

  if (!showSignUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign Up Not Available</h3>
            <p className="text-muted-foreground mb-6">
              Sign up is currently disabled. Please contact your administrator for access.
            </p>
            <Button asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="text-center py-12">
            <UserPlus className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Your admin access request has been submitted. An administrator will review your request and contact you
              soon.
            </p>
            <Button asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Request Admin Access</CardTitle>
            <CardDescription>Submit a request to become an admin user</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email address"
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us why you need admin access..."
                rows={3}
                disabled={submitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="link" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              Your request will be reviewed by an administrator. You will be contacted via email once your request is
              processed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
