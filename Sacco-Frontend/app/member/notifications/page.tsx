"use client"

import React from 'react'
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, Clock, Mail, AlertCircle, Info } from "lucide-react"
import { io } from 'socket.io-client'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import axios from 'axios'

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'alert' | 'success' | 'info' | 'default';
  sentBy: string;
  sentAt: string;
}

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [activeTab, setActiveTab] = useState("all")

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("https://saccosmart.onrender.com/api/notifications/member", {
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

  useEffect(() => {
    const socket = io('https://saccosmart.onrender.com');

    socket.on('notification', (newNotification: Notification) => {
      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("https://saccosmart.onrender.com/api/dashboard/member", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data.user)
      } catch (err) {
        // fallback: do nothing, user stays null
      }
    }
    fetchUser()
  }, [])

  const markAsRead = (id: string) => {}
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const unreadCount = notifications.length
  const totalCount = notifications.length

  const typeStyles: Record<Notification['type'], {
    border: string;
    bg: string;
    iconBg: string;
    icon: React.ReactNode;

  }> = {
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

  if (loading || !user) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <DashboardLayout role="member" user={user}>
      <div className="space-y-8 px-2 sm:px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-sacco-blue mb-1">Notifications</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-lg">Stay updated with important messages and announcements</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto items-start sm:items-center">
            <Badge variant="secondary" className="text-sm bg-yellow-400 text-white px-3 py-1 rounded-full">
              {unreadCount} unread
            </Badge>
            <Button onClick={markAllAsRead} variant="outline" size="sm" className="rounded-full border-sacco-blue text-sacco-blue hover:bg-sacco-blue/10 w-full sm:w-auto">
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
            <CardTitle className="text-xl sm:text-2xl font-bold text-sacco-blue flex items-center gap-2">
              <Bell className="h-6 w-6" /> Messages
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">View and manage your notifications from SACCO administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto">
                <TabsList className="grid w-full min-w-[350px] grid-cols-3 rounded-full bg-sacco-blue/10 mb-4">
                  <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-sacco-blue data-[state=active]:text-white transition">All ({totalCount})</TabsTrigger>
                  <TabsTrigger value="unread" className="rounded-full data-[state=active]:bg-yellow-400 data-[state=active]:text-white transition">Unread ({unreadCount})</TabsTrigger>
                  <TabsTrigger value="read" className="rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white transition">Read ({totalCount - unreadCount})</TabsTrigger>
                </TabsList>
              </div>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
