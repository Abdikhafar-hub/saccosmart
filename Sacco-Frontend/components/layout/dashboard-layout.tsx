"use client"

import type React from "react"

import { SidebarNavigation } from "./sidebar-navigation"
import { TopNavbar } from "./top-navbar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useState } from "react"
import { DialogTitle } from "@radix-ui/react-dialog"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "member" | "treasurer" | "admin"
  user: {
    name: string
    email: string
    role: string
    avatar?: string
  }
}

export function DashboardLayout({ children, role, user }: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden sm:block h-full">
        <SidebarNavigation role={role} />
      </div>
      {/* Mobile Sidebar Drawer */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <DialogTitle className="sr-only">Sidebar Navigation</DialogTitle>
          <SidebarNavigation role={role} />
        </SheetContent>
      </Sheet>
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar user={user} onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
