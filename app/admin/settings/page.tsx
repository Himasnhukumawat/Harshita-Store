"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { AppSettings } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Shield } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function SettingsPage() {
  const { adminUser } = useAuth()
  const [settings, setSettings] = useState<AppSettings>({
    id: "app_settings",
    showSignUp: true,
    updatedAt: null,
    updatedBy: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, "settings", "app_settings")
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setSettings({ id: docSnap.id, ...docSnap.data() } as AppSettings)
      } else {
        // Create default settings if they don't exist
        const defaultSettings = {
          showSignUp: true,
          updatedAt: serverTimestamp(),
          updatedBy: adminUser?.id || "",
        }
        await setDoc(docRef, defaultSettings)
        setSettings({ id: "app_settings", ...defaultSettings, updatedAt: null, updatedBy: adminUser?.id || "" })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      setError("Failed to fetch settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const docRef = doc(db, "settings", "app_settings")
      const updatedSettings = {
        showSignUp: settings.showSignUp,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser?.id || "",
      }

      await setDoc(docRef, updatedSettings, { merge: true })
      setSuccess("Settings saved successfully!")

      // Update local state
      setSettings({
        ...settings,
        ...updatedSettings,
        updatedAt: null, // Will be set by server
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      setError("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  // Check if current user is super admin
  const isSuperAdmin = adminUser?.role === "super_admin"

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Application settings</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Limited Access</h3>
            <p className="text-muted-foreground">
              You can access the system, but only Super Admins can manage application settings.
              <br />
              Contact a Super Admin if you need to modify these settings.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading settings..." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage application settings</p>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Authentication Settings
          </CardTitle>
          <CardDescription>Control user access and authentication options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showSignUp" className="text-base">
                Show Sign Up Option
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow users to see a sign-up option on the login page. When enabled, users can request admin access.
              </p>
            </div>
            <Switch
              id="showSignUp"
              checked={settings.showSignUp}
              onCheckedChange={(checked) => setSettings({ ...settings, showSignUp: checked })}
              disabled={saving}
            />
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          {settings.updatedAt && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Last updated: {new Date(settings.updatedAt.toDate()).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
