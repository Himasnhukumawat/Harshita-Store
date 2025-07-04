import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { StoreSettingsProvider } from "@/contexts/store-settings-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Harshita General Store - Admin Panel",
  description: "Complete admin panel for managing your shop inventory, categories, products, and offers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <StoreSettingsProvider>
            {children}
          </StoreSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
