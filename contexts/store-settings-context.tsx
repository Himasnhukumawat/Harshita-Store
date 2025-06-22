"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getStoreSettings, initializeStoreSettings } from "@/lib/store-settings-service"
import type { StoreSettings } from "@/lib/types"

interface StoreSettingsContextType {
  settings: StoreSettings | null
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined)

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let storeSettings = await getStoreSettings()
      
      // If no settings exist, initialize with defaults
      if (!storeSettings) {
        await initializeStoreSettings("system")
        storeSettings = await getStoreSettings()
      }
      
      setSettings(storeSettings)
    } catch (err) {
      console.error("Error fetching store settings:", err)
      setError(err instanceof Error ? err.message : "Failed to load store settings")
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = async () => {
    await fetchSettings()
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const value: StoreSettingsContextType = {
    settings,
    loading,
    error,
    refreshSettings,
  }

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  )
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext)
  if (context === undefined) {
    throw new Error("useStoreSettings must be used within a StoreSettingsProvider")
  }
  return context
} 