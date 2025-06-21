"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Eye, EyeOff, Shield, UserPlus, Crown } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const { user, login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/admin")
    }
    checkSignUpSettings()
  }, [user, router])

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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      await login(email, password)
      router.push("/admin")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    setError("")
    setSuccess("")
    setResetLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess("Password reset email sent! Check your inbox.")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>Sign in with your Firebase account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading || resetLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading || resetLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || resetLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || resetLoading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handlePasswordReset}
                disabled={loading || resetLoading}
                className="text-sm"
              >
                {resetLoading ? "Sending..." : "Forgot Password?"}
              </Button>
            </div>
          </form>

          {showSignUp && (
            <div className="mt-4 text-center">
              <Button variant="outline" asChild className="w-full">
                <Link href="/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Request Admin Access
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-4 text-center">
            <Button variant="ghost" asChild className="w-full text-yellow-600 hover:text-yellow-700">
              <Link href="/admin/setup">
                <Crown className="mr-2 h-4 w-4" />
                First Time? Become Super Admin
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">Harshita General Store Admin Panel</p>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-800">Firebase Auth Access</p>
            </div>
            <p className="text-xs text-blue-700">
              Any Firebase Auth user can login. First-time users can set themselves as Super Admin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
