"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  CreditCard,
  Users,
  FileText,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  Banknote,
  UserCheck,
  FolderOpen,
  HelpCircle,
  Bell,
  MessageSquare,
} from "lucide-react"

interface SidebarNavigationProps {
  role: "member" | "treasurer" | "admin"
}

export function SidebarNavigation({ role }: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const getNavigationItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        href: `/${role}/dashboard`,
        icon: LayoutDashboard,
      },
    ]

    // Add Contributions for all roles
    baseItems.push({
      title: "Contributions",
      href: `/${role}/contributions`,
      icon: CreditCard,
    })

    // Add Loans only for member and treasurer roles, not for admin
    if (role === "member" || role === "treasurer") {
      baseItems.push({
        title: "Loans",
        href: `/${role}/loans`,
        icon: Banknote,
      })
    }

    if (role === "admin" || role === "treasurer") {
      baseItems.push({
        title: "Members",
        href: `/${role}/members`,
        icon: Users,
      })
    }

    if (role === "treasurer") {
      baseItems.push({
        title: "Verify Contributions",
        href: `/${role}/verify`,
        icon: UserCheck,
      })
    }

    // Member-only pages
    if (role === "member") {
      baseItems.push(
        {
          title: "Notifications",
          href: `/${role}/notifications`,
          icon: Bell,
        },
        {
          title: "FAQs",
          href: `/${role}/faqs`,
          icon: MessageSquare,
        },
        {
          title: "Support",
          href: `/${role}/support`,
          icon: HelpCircle,
        },
        {
          title: "Documents",
          href: `/${role}/documents`,
          icon: FileText,
        },
      )
    }

    // Admin-only pages
    if (role === "admin") {
      baseItems.push(
        {
          title: "Documents",
          href: `/${role}/documents`,
          icon: FolderOpen,
        },
        {
          title: "Support Center",
          href: `/${role}/support`,
          icon: HelpCircle,
        },
        {
          title: "Notifications",
          href: `/${role}/notifications`,
          icon: Bell,
        },
      )
    }

    baseItems.push(
      {
        title: "Reports",
        href: `/${role}/reports`,
        icon: FileText,
      },
      {
        title: "Settings",
        href: `/${role}/settings`,
        icon: Settings,
      },
    )

    return baseItems
  }

  const navigationItems = getNavigationItems()

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-sacco-blue rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sacco-blue">SaccoSmart</h2>
              <p className="text-xs text-gray-500 capitalize">{role} Portal</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed ? "px-2" : "px-3",
                    isActive && "bg-sacco-blue text-white hover:bg-sacco-blue/90",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <Link href="/auth/login">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
              isCollapsed ? "px-2" : "px-3",
            )}
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </Link>
      </div>
    </div>
  )
}
