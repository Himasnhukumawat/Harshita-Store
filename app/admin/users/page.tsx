"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { AdminUser } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, Users, Shield, Calendar } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function AdminUsersPage() {
  const { adminUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

      // Sort by createdAt in memory
      const sortedUsers = usersData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return b.createdAt.toMillis() - a.createdAt.toMillis()
      })

      setUsers(sortedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to fetch admin users")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (id === adminUser?.id) {
      setError("You cannot delete your own account")
      return
    }

    if (confirm(`Are you sure you want to delete admin user "${email}"?`)) {
      try {
        await deleteDoc(doc(db, "admins", id))
        setUsers(users.filter((user) => user.id !== id))
      } catch (error) {
        console.error("Error deleting user:", error)
        setError("Failed to delete admin user")
      }
    }
  }

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    if (id === adminUser?.id) {
      setError("You cannot deactivate your own account")
      return
    }

    try {
      await updateDoc(doc(db, "admins", id), {
        isActive: !currentStatus,
      })
      setUsers(users.map((user) => (user.id === id ? { ...user, isActive: !currentStatus } : user)))
    } catch (error) {
      console.error("Error updating user status:", error)
      setError("Failed to update user status")
    }
  }

  // Check if current user is super admin
  const isSuperAdmin = adminUser?.role === "super_admin"

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Users</h1>
          <p className="text-muted-foreground">Manage admin users</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Limited Access</h3>
            <p className="text-muted-foreground">
              You can access the system, but only Super Admins can manage other admin users.
              <br />
              Contact a Super Admin if you need additional permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading admin users..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Users</h1>
          <p className="text-muted-foreground">Manage admin users and permissions</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Admin User
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                      onClick={() => handleDelete(user.id, user.email)}
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
            <p className="text-muted-foreground mb-4">Create your first admin user to get started</p>
            <Button asChild>
              <Link href="/admin/users/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Admin User
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
