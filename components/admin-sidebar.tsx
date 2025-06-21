"use client"

import { Package, Tag, Users, Home, LogOut, List, Settings, Shield, Crown } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Tag,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Product Lists",
    url: "/admin/product-lists",
    icon: List,
  },
  {
    title: "Inventory",
    url: "/admin/inventory",
    icon: Package,
  },
  {
    title: "Admin Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "User Management",
    url: "/admin/user-management",
    icon: Shield,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const { user, adminUser, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Show setup option if user is not in admin collection or not super admin
  const showSetupOption = !adminUser || adminUser.role !== "super_admin"

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <span className="font-semibold">Harshita Store</span>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {showSetupOption && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/admin/setup"}>
                    <Link href="/admin/setup">
                      <Crown />
                      <span>Become Super Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {adminUser?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{adminUser?.name || user?.email}</p>
                <div className="flex items-center gap-1">
                  <Badge variant={adminUser?.role === "super_admin" ? "default" : "secondary"} className="text-xs">
                    {adminUser?.role === "super_admin" ? "Super Admin" : "Admin"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
