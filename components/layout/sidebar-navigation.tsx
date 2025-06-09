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
  Bot,
} from "lucide-react"
import { motion } from "framer-motion"

interface SidebarNavigationProps {
  role: "member" | "treasurer" | "admin"
}

export function SidebarNavigation({ role }: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const pathname = usePathname()

  const getNavigationItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        href: `/${role}/dashboard`,
        icon: LayoutDashboard,
        color: "text-purple-500",
        bgColor: "bg-purple-100",
      },
    ]

    // Add Contributions for all roles
    baseItems.push({
      title: "Contributions",
      href: `/${role}/contributions`,
      icon: CreditCard,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    })

    // Add Loans only for member and treasurer roles, not for admin
    if (role === "member" || role === "treasurer") {
      baseItems.push({
        title: "Loans",
        href: `/${role}/loans`,
        icon: Banknote,
        color: "text-green-500",
        bgColor: "bg-green-100",
      })
    }

    if (role === "admin" || role === "treasurer") {
      baseItems.push({
        title: "Members",
        href: `/${role}/members`,
        icon: Users,
        color: "text-pink-500",
        bgColor: "bg-pink-100",
      })
    }

    if (role === "treasurer") {
      baseItems.push({
        title: "Verify Contributions",
        href: `/${role}/verify`,
        icon: UserCheck,
        color: "text-yellow-500",
        bgColor: "bg-yellow-100",
      })
    }

    // Member-only pages
    if (role === "member") {
      baseItems.push(
        {
          title: "Notifications",
          href: `/${role}/notifications`,
          icon: Bell,
          color: "text-red-500",
          bgColor: "bg-red-100",
        },
        {
          title: "Smart Sacco AI",
          href: `/${role}/smart-sacco-ai`,
          icon: Bot,
          color: "text-violet-500",
          bgColor: "bg-violet-100",
        },
        {
          title: "FAQs",
          href: `/${role}/faqs`,
          icon: MessageSquare,
          color: "text-indigo-500",
          bgColor: "bg-indigo-100",
        },
        {
          title: "Support",
          href: `/${role}/support`,
          icon: HelpCircle,
          color: "text-orange-500",
          bgColor: "bg-orange-100",
        },
        {
          title: "Documents",
          href: `/${role}/documents`,
          icon: FileText,
          color: "text-teal-500",
          bgColor: "bg-teal-100",
        },
      )
    }

    // Admin-only pages
    if (role === "admin") {
      baseItems.splice(2, 0, {
        title: "Loans",
        href: `/${role}/loans`,
        icon: Banknote,
        color: "text-green-500",
        bgColor: "bg-green-100",
      })
      baseItems.push(
        {
          title: "Documents",
          href: `/${role}/documents`,
          icon: FolderOpen,
          color: "text-teal-500",
          bgColor: "bg-teal-100",
        },
        {
          title: "Support Center",
          href: `/${role}/support`,
          icon: HelpCircle,
          color: "text-orange-500",
          bgColor: "bg-orange-100",
        },
        {
          title: "Notifications",
          href: `/${role}/notifications`,
          icon: Bell,
          color: "text-red-500",
          bgColor: "bg-red-100",
        },
      )
    }

    baseItems.push(
      {
        title: "Reports",
        href: `/${role}/reports`,
        icon: FileText,
        color: "text-cyan-500",
        bgColor: "bg-cyan-100",
      },
      {
        title: "Settings",
        href: `/${role}/settings`,
        icon: Settings,
        color: "text-gray-500",
        bgColor: "bg-gray-100",
      },
    )

    return baseItems
  }

  const navigationItems = getNavigationItems()

  return (
    <motion.div
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm border-l-4 border-l-blue-500"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {(!isCollapsed || isHovering) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center space-x-2"
          >
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg shadow">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                SaccoSmart
              </h2>
              <p className="text-xs text-gray-500 capitalize">{role} Portal</p>
            </div>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-all"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4 text-gray-500" />
          ) : (
            <X className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start group transition-all duration-200",
                      isCollapsed ? "px-2" : "px-3",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800",
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        item.bgColor,
                        isActive ? "bg-white/20" : item.bgColor,
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-transform",
                          item.color,
                          isActive ? "text-white" : item.color,
                          !isCollapsed && "mr-3",
                        )}
                      />
                    </div>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-2"
                      >
                        {item.title}
                      </motion.span>
                    )}
                    {isActive && !isCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-1.5 h-6 bg-white rounded-full"
                        transition={{ type: "spring", stiffness: 500 }}
                      />
                    )}
                  </Button>
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <Link href="/auth/login">
          <motion.div whileHover={{ x: 2 }}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors",
                isCollapsed ? "px-2" : "px-3",
              )}
            >
              <div className="p-2 rounded-lg bg-red-100">
                <LogOut
                  className={cn(
                    "h-4 w-4",
                    !isCollapsed && "mr-3",
                  )}
                />
              </div>
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  )
}