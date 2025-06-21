"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { AdminUser } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, Users, Shield, Calendar, UserPlus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function UserManagementPage() {
  const { adminUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "super_admin",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "admins"))
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AdminUser[]

      const sortedUsers = usersData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return b.createdAt.toMillis() - a.createdAt.toMillis()
      })

      setUsers(sortedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setCreating(true)

    try {
      if (newUser.password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password)
      const firebaseUser = userCredential.user

      // Add user to admin collection
      await setDoc(doc(db, "admins", firebaseUser.uid), {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: adminUser?.id || "",
      })

      setSuccess(`User ${newUser.email} created successfully!`)
      setNewUser({ name: "", email: "", password: "", role: "admin" })
      setShowCreateForm(false)
      fetchUsers()
    } catch (error: any) {
      console.error("Error creating user:", error)
      setError(error.message || "Failed to create user")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async (id: string, email: string) => {
    if (id === adminUser?.id) {
      setError("You cannot delete your own account")
      return
    }

    if (
      confirm(
        `Are you sure you want to delete user "${email}"? This will remove them from both Firebase Auth and the admin collection.`,
      )
    ) {
      try {
        await deleteDoc(doc(db, "admins", id))
        setUsers(users.filter((user) => user.id !== id))
        setSuccess(`User ${email} deleted successfully`)
      } catch (error) {
        console.error("Error deleting user:", error)
        setError("Failed to delete user")
      }
    }
  }

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    if (id === adminUser?.id) {
      setError("You cannot deactivate your own account")
      return
    }

    try {
      await setDoc(doc(db, "admins", id), { isActive: !currentStatus }, { merge: true })
      setUsers(users.map((user) => (user.id === id ? { ...user, isActive: !currentStatus } : user)))
    } catch (error) {
      console.error("Error updating user status:", error)
      setError("Failed to update user status")
    }
  }

  const isSuperAdmin = adminUser?.role === "super_admin"

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Limited Access</h3>
            <p className="text-muted-foreground">
              You can access the system, but only Super Admins can manage users.
              <br />
              Any user with a Firebase account can login to the system.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading users..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage Firebase Auth users and admin permissions</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showCreateForm ? "Cancel" : "Create User"}
        </Button>
      </div>

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

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New User
            </CardTitle>
            <CardDescription>Create a new user in Firebase Auth and admin collection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                    disabled={creating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    disabled={creating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    required
                    disabled={creating}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "admin" | "super_admin") => setNewUser({ ...newUser, role: value })}
                    disabled={creating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>
              <strong>Note:</strong> Any user with a Firebase Auth account can login to the system. Users listed below
              have additional admin permissions.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {users.length > 0 ? (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                          {user.role === "super_admin" ? "Super Admin" : "Admin"}
                        </Badge>
                        {user.id === adminUser?.id && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-2">{user.email}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : "No date"}
                        </div>
                        {user.createdBy && (
                          <div>Created by: {users.find((u) => u.id === user.createdBy)?.name || "Unknown"}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleUserStatus(user.id, user.isActive)}
                        disabled={user.id === adminUser?.id}
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      disabled={user.id === adminUser?.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No admin users found</h3>
            <p className="text-muted-foreground mb-4">
              Create admin users to give them additional permissions beyond basic Firebase Auth access
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Admin User
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
