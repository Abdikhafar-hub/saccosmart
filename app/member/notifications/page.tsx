"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, Clock, Mail, AlertCircle, Info } from "lucide-react"

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [activeTab, setActiveTab] = useState("all")

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Member",
    avatar: "/placeholder.svg?height=32&width=32",
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5000/api/notifications/member", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch notifications")
        const data = await res.json()
        setNotifications(data)
      } catch (err) {
        setError("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const markAsRead = (id) => {}
  const markAllAsRead = () => {}

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications
      case "read":
        return notifications
      default:
        return notifications
    }
  }

  const getNotificationIcon = () => <Bell className="h-4 w-4 text-gray-500" />

  const getTypeColor = () => "bg-gray-100 text-gray-800"

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const unreadCount = notifications.length
  const totalCount = notifications.length

  const typeStyles = {
    alert: {
      border: "border-red-500",
      bg: "bg-red-50",
      iconBg: "bg-red-100 text-red-600",
      icon: <AlertCircle className="h-6 w-6" />,
    },
    success: {
      border: "border-green-500",
      bg: "bg-green-50",
      iconBg: "bg-green-100 text-green-600",
      icon: <CheckCircle className="h-6 w-6" />,
    },
    info: {
      border: "border-blue-500",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100 text-blue-600",
      icon: <Info className="h-6 w-6" />,
    },
    default: {
      border: "border-sacco-blue",
      bg: "bg-blue-50/30",
      iconBg: "bg-sacco-blue/10 text-sacco-blue",
      icon: <Bell className="h-6 w-6" />,
    },
  }

  return (
    <DashboardLayout role="member" user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-sacco-blue mb-1">Notifications</h1>
            <p className="text-gray-600 mt-1 text-lg">Stay updated with important messages and announcements</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm bg-yellow-400 text-white px-3 py-1 rounded-full">
              {unreadCount} unread
            </Badge>
            <Button onClick={markAllAsRead} variant="outline" size="sm" className="rounded-full border-sacco-blue text-sacco-blue hover:bg-sacco-blue/10">
              Mark All as Read
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md rounded-xl bg-gradient-to-r from-blue-100 to-blue-50">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-sacco-blue/10 rounded-full p-3">
                <Bell className="h-8 w-8 text-sacco-blue" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-sacco-blue">{totalCount}</p>
                <p className="text-base text-gray-600">Total Notifications</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md rounded-xl bg-gradient-to-r from-yellow-100 to-yellow-50">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-yellow-400/20 rounded-full p-3">
                <Mail className="h-8 w-8 text-yellow-500" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-yellow-500">{unreadCount}</p>
                <p className="text-base text-gray-600">Unread Messages</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md rounded-xl bg-gradient-to-r from-green-100 to-green-50">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-green-400/20 rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-green-500">{totalCount - unreadCount}</p>
                <p className="text-base text-gray-600">Read Messages</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-sacco-blue flex items-center gap-2">
              <Bell className="h-6 w-6" /> Messages
            </CardTitle>
            <CardDescription className="text-base">View and manage your notifications from SACCO administrators</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading notifications...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 rounded-full bg-sacco-blue/10 mb-4">
                  <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-sacco-blue data-[state=active]:text-white transition">All ({totalCount})</TabsTrigger>
                  <TabsTrigger value="unread" className="rounded-full data-[state=active]:bg-yellow-400 data-[state=active]:text-white transition">Unread ({unreadCount})</TabsTrigger>
                  <TabsTrigger value="read" className="rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white transition">Read ({totalCount - unreadCount})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  <div className="space-y-4">
                    {getFilteredNotifications().length === 0 ? (
                      <div className="text-center py-12">
                        <Bell className="h-16 w-16 text-sacco-blue mx-auto mb-4 animate-bounce" />
                        <p className="text-gray-500 text-lg font-semibold">No notifications found</p>
                      </div>
                    ) : (
                      getFilteredNotifications().map((notification) => {
                        const type = notification.type || "default"
                        const style = typeStyles[type] || typeStyles.default
                        return (
                          <Card
                            key={notification._id}
                            className={`transition-all shadow-md border-l-8 ${style.border} ${style.bg} hover:scale-[1.01] rounded-xl`}
                          >
                            <CardContent className="p-5 flex items-start space-x-4">
                              <div className={`rounded-full p-3 ${style.iconBg} flex-shrink-0`}>{style.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-bold text-lg text-gray-900">{notification.title}</h3>
                                  <Badge variant="secondary" className="text-xs bg-yellow-400 text-white">New</Badge>
                                </div>
                                <p className="text-gray-700 text-base mb-2">{notification.message}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>From: {notification.sentBy || "Admin"}</span>
                                  <span>{notification.sentAt ? formatTimestamp(notification.sentAt) : ""}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
