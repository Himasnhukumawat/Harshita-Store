"use client"

import type React from "react"

import { useState } from "react"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Crown, CheckCircle } from "lucide-react"

export default function SetupPage() {
  const { user, adminUser } = useAuth()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleMakeSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError("You must be logged in to become a super admin")
      return
    }

    setError("")
    setLoading(true)

    try {
      await setDoc(doc(db, "admins", user.uid), {
        email: user.email,
        name: name || user.displayName || user.email?.split("@")[0] || "Super Admin",
        role: "super_admin",
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: "self-setup",
      })

      setSuccess(true)
    } catch (error: any) {
      console.error("Error making super admin:", error)
      setError(error.message || "Failed to make super admin")
    } finally {
      setLoading(false)
    }
  }

  // If user is already a super admin, show success message
  if (adminUser?.role === "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="text-center py-12">
            <Crown className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">You're Already a Super Admin!</h3>
            <p className="text-muted-foreground mb-6">
              You have full access to all admin features including user management and settings.
            </p>
            <Button asChild>
              <a href="/admin">Go to Dashboard</a>
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
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Super Admin Setup Complete!</h3>
            <p className="text-muted-foreground mb-6">
              You are now a Super Admin with full access to all features. Please refresh the page or navigate to the
              dashboard.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <a href="/admin">Go to Dashboard</a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/admin/users">Manage Users</a>
              </Button>
            </div>
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
            <div className="p-3 bg-yellow-100 rounded-full">
              <Crown className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Become Super Admin</CardTitle>
            <CardDescription>Set yourself up as the first Super Admin</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMakeSuperAdmin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">This is your Firebase Auth email</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={user?.displayName || user?.email?.split("@")[0] || "Enter your name"}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">This will be shown in the admin panel</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up..." : "Make Me Super Admin"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800">Super Admin Privileges</p>
            </div>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Manage other admin users</li>
              <li>• Control application settings</li>
              <li>• Full access to all features</li>
              <li>• Create and delete user accounts</li>
            </ul>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Current User ID: <code className="bg-muted px-1 rounded">{user?.uid}</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
