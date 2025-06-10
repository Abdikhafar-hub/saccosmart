"use client"

import type React from "react"

import { SidebarNavigation } from "./sidebar-navigation"
import { TopNavbar } from "./top-navbar"

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
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarNavigation role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar user={user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
