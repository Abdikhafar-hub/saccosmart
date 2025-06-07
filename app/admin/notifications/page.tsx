"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, Send, Edit, Trash2, Users, Clock, FileText, Mail, AlertCircle, Calendar, CheckCircle, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import axios from "axios"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DataTable } from "@/components/ui/data-table"

interface Member {
  _id: string;
  name: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  target: 'all' | 'member';
  targetMemberId?: string;
  recipients: number;
  sentAt: string;
  status: 'Sent' | 'Draft' | 'Scheduled';
  targetRole?: string;
}

interface NotificationSummary {
  totalSent: number;
  draftCount: number;
  totalRecipients: number;
  thisMonth: number;
}

interface NotificationForm {
  title: string;
  message: string;
  target: 'all' | 'member';
  targetMemberId: string;
}

export default function AdminNotificationsPage() {
  const [notificationForm, setNotificationForm] = useState<NotificationForm>({
    title: "",
    message: "",
    target: "all",
    targetMemberId: "",
  })
  const [summary, setSummary] = useState<NotificationSummary | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editNotification, setEditNotification] = useState<Notification | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteNotificationId, setDeleteNotificationId] = useState<string | null>(null)

  // Fetch summary and notifications
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const [summaryRes, notificationsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/notifications/summary", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/notifications", { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setSummary(summaryRes.data)
        setNotifications(notificationsRes.data)
      } catch (err) {
        setError("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch members for the dropdown
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:5000/api/member/all", { headers: { Authorization: `Bearer ${token}` } })
        setMembers(res.data)
      } catch (err) {
        // ignore for now
      }
    }
    fetchMembers()
  }, [])

  // Send notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const payload: {
        title: string;
        message: string;
        status: string;
        target?: 'all' | 'member';
        targetMemberId?: string;
      } = {
        title: notificationForm.title,
        message: notificationForm.message,
        status: "Sent",
      }
      if (notificationForm.target === "all") {
        payload.target = "all"
      } else if (notificationForm.target === "member" && notificationForm.targetMemberId) {
        payload.target = "member"
        payload.targetMemberId = notificationForm.targetMemberId
      }
      await axios.post("http://localhost:5000/api/notifications", payload, { headers: { Authorization: `Bearer ${token}` } })
      setNotificationForm({ title: "", message: "", target: "all", targetMemberId: "" })
      // Refresh data
      const [summaryRes, notificationsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/notifications/summary", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/notifications", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setSummary(summaryRes.data)
      setNotifications(notificationsRes.data)
    } catch (err) {
      setError("Failed to send notification")
    }
  }

  // Table columns with enhancements
  const columns = [
    {
      key: "title",
      label: "Title",
      render: (value: any, row: Notification) => (
        <div className="flex items-center gap-2 font-medium max-w-[200px] truncate">
          <Bell className="h-4 w-4 text-sacco-blue" />
          {value}
        </div>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (value: any, row: Notification) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[300px] truncate text-sm text-gray-600 cursor-pointer">
              {value}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {value}
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      key: "targetRole",
      label: "Target Audience",
      render: (value: any, row: Notification) => {
        const variant = value === "all" ? "default" : value === "member" ? "secondary" : "outline"
        return (
          <Badge variant={variant} className={
            value === "all"
              ? "bg-blue-100 text-blue-800"
              : value === "member"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        )
      },
    },
    {
      key: "recipients",
      label: "Recipients",
      render: (value: any, row: Notification) => (
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3 text-gray-500" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "sentAt",
      label: "Sent At",
      render: (value: any, row: Notification) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">{value ? new Date(value).toLocaleString() : "N/A"}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: any, row: Notification) => {
        let color = "bg-green-100 text-green-800"
        if (value === "Draft") color = "bg-yellow-100 text-yellow-800"
        if (value === "Scheduled") color = "bg-blue-100 text-blue-800"
        return (
          <Badge className={color + " px-2 py-1 rounded-full font-semibold flex items-center gap-1"}>
            {value}
            {value === "Sent" && <CheckCircle className="h-3 w-3 ml-1 text-green-600" />}
            {value === "Draft" && <Edit className="h-3 w-3 ml-1 text-yellow-600" />}
            {value === "Scheduled" && <Calendar className="h-3 w-3 ml-1 text-blue-600" />}
          </Badge>
        )
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: Notification) => (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="rounded-full border-sacco-blue text-sacco-blue hover:bg-sacco-blue/10" onClick={() => handleEditNotification(row)}>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="rounded-full text-red-600 hover:bg-red-50" onClick={() => { setDeleteNotificationId(row._id); setDeleteDialogOpen(true) }}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ]

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

  const handleDeleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      // Refresh data
      const [summaryRes, notificationsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/notifications/summary", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/notifications", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setSummary(summaryRes.data)
      setNotifications(notificationsRes.data)
    } catch (err) {
      setError("Failed to delete notification")
    }
  }

  const handleEditNotification = (notification: Notification) => {
    setEditNotification(notification)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editNotification) return
    try {
      const token = localStorage.getItem("token")
      await axios.put(`http://localhost:5000/api/notifications/${editNotification._id}`, editNotification, { headers: { Authorization: `Bearer ${token}` } })
      setEditDialogOpen(false)
      setEditNotification(null)
      // Refresh data
      const [summaryRes, notificationsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/notifications/summary", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/notifications", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setSummary(summaryRes.data)
      setNotifications(notificationsRes.data)
    } catch (err) {
      setError("Failed to update notification")
    }
  }

  return (
    <DashboardLayout
      role="admin"
      user={{
        name: "Admin User",
        email: "admin@saccosmart.com",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "admin",
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Manage and broadcast notifications to users</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-sacco-blue hover:bg-sacco-blue/90">
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Broadcast Notification</DialogTitle>
                <DialogDescription>Send a notification to selected user groups</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <Label htmlFor="title">Notification Title</Label>
                  <Input
                    id="title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    placeholder="Enter notification title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="target">Target Audience</Label>
                  <Select
                    value={notificationForm.target}
                    onValueChange={(value: 'all' | 'member') => setNotificationForm({ ...notificationForm, target: value, targetMemberId: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="member">Specific Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {notificationForm.target === "member" && (
                  <div>
                    <Label htmlFor="targetMemberId">Select Member</Label>
                    <Select
                      value={notificationForm.targetMemberId}
                      onValueChange={(value) => setNotificationForm({ ...notificationForm, targetMemberId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.length === 0 ? (
                          <div className="px-4 py-2 text-gray-500">No members found</div>
                        ) : (
                          members.map((member) => (
                            <SelectItem key={member._id} value={member._id}>{member.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    placeholder="Enter your notification message"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Send Now
                  </Button>
                  <Button type="button" variant="outline" className="flex-1">
                    Save Draft
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notification Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <FileText className="h-5 w-5 text-sacco-blue" />
              <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sacco-blue">{summary?.totalSent ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <Edit className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-sm font-medium text-gray-600">Draft Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary?.draftCount ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <CardTitle className="text-sm font-medium text-gray-600">Total Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary?.totalRecipients ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{summary?.thisMonth ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Notifications */}
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-sacco-blue flex items-center gap-2">
              <Bell className="h-6 w-6" /> Notification History
            </CardTitle>
            <CardDescription className="text-base">View and manage all sent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <DataTable columns={columns} data={notifications} />
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>

      {/* Edit Notification Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
            <DialogDescription>Edit and save changes to this notification</DialogDescription>
          </DialogHeader>
          {editNotification && (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit() }} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Notification Title</Label>
                <Input
                  id="edit-title"
                  value={editNotification.title}
                  onChange={(e) => setEditNotification({ ...editNotification, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-message">Message</Label>
                <Textarea
                  id="edit-message"
                  value={editNotification.message}
                  onChange={(e) => setEditNotification({ ...editNotification, message: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">Save</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>Are you sure you want to delete this notification? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 mt-4">
            <Button type="button" variant="destructive" className="flex-1" onClick={async () => { if (deleteNotificationId) { await handleDeleteNotification(deleteNotificationId); setDeleteDialogOpen(false); setDeleteNotificationId(null); } }}>Delete</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}