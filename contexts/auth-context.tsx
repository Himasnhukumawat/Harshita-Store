"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signInWithEmailAndPassword, signOut, type AuthError } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { AdminUser } from "@/lib/types"

interface AuthContextType {
  user: User | null
  adminUser: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Check if user exists in admin collection for role information
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.uid))
          if (adminDoc.exists() && adminDoc.data().isActive) {
            setAdminUser({ id: adminDoc.id, ...adminDoc.data() } as AdminUser)
          } else {
            // User exists in Firebase Auth but not in admin collection
            // Create a default admin user entry or allow basic access
            setAdminUser({
              id: user.uid,
              email: user.email || "",
              name: user.displayName || user.email?.split("@")[0] || "User",
              role: "admin", // Default role
              isActive: true,
              createdAt: null,
              createdBy: "system",
            } as AdminUser)
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          // Still allow login even if admin check fails
          setAdminUser({
            id: user.uid,
            email: user.email || "",
            name: user.displayName || user.email?.split("@")[0] || "User",
            role: "admin",
            isActive: true,
            createdAt: null,
            createdBy: "system",
          } as AdminUser)
        }
      } else {
        setAdminUser(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // No additional checks - any Firebase Auth user can login
    } catch (error) {
      const authError = error as AuthError
      throw new Error(getAuthErrorMessage(authError.code) || (error as Error).message)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return <AuthContext.Provider value={{ user, adminUser, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password."
    case "auth/invalid-email":
      return "Invalid email address."
    case "auth/user-disabled":
      return "This account has been disabled."
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later."
    default:
      return "Login failed. Please check your credentials."
  }
}
