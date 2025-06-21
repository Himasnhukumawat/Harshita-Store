"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { serverTimestamp, setDoc, doc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export default function NewAdminUserPage() {
  const { adminUser } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin" as "admin" | "super_admin",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Check if current user is super admin
  const isSuperAdmin = adminUser?.role === "super_admin"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const newUser = userCredential.user

      // Add user to admin collection
      await setDoc(doc(db, "admins", newUser.uid), {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: adminUser?.id || "",
      })

      router.push("/admin/users")
    } catch (error: any) {
      console.error("Error creating admin user:", error)
      setError(error.message || "Failed to create admin user")
    } finally {
      setLoading(false)
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Admin User</h1>
            <p className="text-muted-foreground">Access limited</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Limited Access</h3>
            <p className="text-muted-foreground">
              You can access the system, but only Super Admins can create new admin users.
              <br />
              Any user with a Firebase account can already login to the system.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Admin User</h1>
          <p className="text-muted-foreground">Add a new admin user to the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin User Details</CardTitle>
          <CardDescription>Fill in the information for the new admin user</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password (min 6 characters)"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "super_admin") => setFormData({ ...formData, role: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Super Admins can manage other admin users. Regular Admins can only manage products and categories.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Admin User"}
              </Button>
              <Button type="button" variant="outline" asChild disabled={loading}>
                <Link href="/admin/users">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
