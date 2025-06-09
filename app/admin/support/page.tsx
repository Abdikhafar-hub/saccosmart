"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Mail, Phone, MapPin, MessageSquare, Clock, User } from "lucide-react"
import axios from "axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AdminSupportPage() {
  const [feedbackForm, setFeedbackForm] = useState({
    title: "",
    category: "",
    priority: "",
    description: "",
  })
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reply, setReply] = useState("")
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null)

  // Fetch all tickets
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:5000/api/support", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTickets(res.data)
      } catch (err) {
        setError("Failed to load tickets")
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  // Admin reply to ticket
  const handleReply = async (ticketId: string) => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `http://localhost:5000/api/support/${ticketId}/respond`,
        { message: reply },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setReply("")
      setReplyingTicketId(null)
      // Refresh tickets
      const res = await axios.get("http://localhost:5000/api/support", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTickets(res.data)
    } catch (err) {
      setError("Failed to send reply")
    }
  }

  const columns = [
    {
      accessorKey: "id",
      header: "Ticket ID",
      cell: ({ row }: any) => <span className="font-mono text-sm">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }: any) => <div className="max-w-[200px] truncate font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-1">
          <User className="h-3 w-3 text-gray-500" />
          <span>{row.getValue("user")}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => <Badge variant="outline">{row.getValue("category")}</Badge>,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: any) => {
        const priority = row.getValue("priority")
        const variant = priority === "High" ? "destructive" : priority === "Medium" ? "default" : "secondary"
        return <Badge variant={variant}>{priority}</Badge>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status")
        const variant = status === "Open" ? "destructive" : status === "In Progress" ? "default" : "secondary"
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      accessorKey: "dateSubmitted",
      header: "Date Submitted",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3 text-gray-500" />
          <span>{row.getValue("dateSubmitted")}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            View
          </Button>
          <Button variant="outline" size="sm">
            Respond
          </Button>
        </div>
      ),
    },
  ]

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle feedback submission
    console.log("Feedback submitted:", feedbackForm)
    // Reset form
    setFeedbackForm({
      title: "",
      category: "",
      priority: "",
      description: "",
    })
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <DashboardLayout
      role="admin"
      user={{
        name: "Admin User",
        email: "admin@saccosmart.com",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "admin"
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
          <p className="text-gray-600">Manage user support and system feedback</p>
        </div>

        {/* Support Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Open Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {tickets.filter((ticket) => ticket.status === "Open").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {tickets.filter((ticket) => ticket.status === "In Progress").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tickets.filter((ticket) => ticket.status === "Resolved").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sacco-blue">{tickets.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Contact Information</CardTitle>
              <CardDescription>Contact details for system administration and support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-sacco-blue" />
                <div>
                  <p className="font-medium">System Support Email</p>
                  <p className="text-sm text-gray-600">support@saccosmart.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-sacco-blue" />
                <div>
                  <p className="font-medium">Support Hotline</p>
                  <p className="text-sm text-gray-600">+254 700 123 456</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-sacco-blue" />
                <div>
                  <p className="font-medium">Office Address</p>
                  <p className="text-sm text-gray-600">123 SACCO Plaza, Nairobi, Kenya</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-sacco-blue" />
                <div>
                  <p className="font-medium">Support Hours</p>
                  <p className="text-sm text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit System Feedback</CardTitle>
              <CardDescription>Report issues or provide feedback about the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    value={feedbackForm.title}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={feedbackForm.category}
                      onValueChange={(value) => setFeedbackForm({ ...feedbackForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="payment">Payment Issue</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={feedbackForm.priority}
                      onValueChange={(value) => setFeedbackForm({ ...feedbackForm, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={feedbackForm.description}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, description: e.target.value })}
                    placeholder="Detailed description of the issue or feedback"
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Support Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription>Track and manage user support requests and issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="border rounded-lg p-4 mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{ticket.title || ticket.subject}</div>
                      <div className="text-sm text-gray-600">{ticket.user?.name} ({ticket.user?.email})</div>
                      <div className="text-xs text-gray-500">ID: {ticket._id} | {new Date(ticket.createdAt).toLocaleDateString()}</div>
                      <div>
                        <Badge variant="outline">{ticket.category}</Badge>{" "}
                        <Badge variant="outline">{ticket.priority}</Badge>{" "}
                        <Badge variant="outline">{ticket.status}</Badge>
                      </div>
                      <div className="mt-2">{ticket.description}</div>
                      {ticket.responses && ticket.responses.length > 0 && (
                        <div className="mt-2">
                          <span className="font-semibold">Responses:</span>
                          <ul className="ml-4 list-disc">
                            {ticket.responses.map((resp: any, idx: number) => (
                              <li key={idx}>
                                <span className="text-xs text-gray-600">{new Date(resp.date).toLocaleString()}:</span>{" "}
                                {resp.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div>
                      {replyingTicketId === ticket._id ? (
                        <div>
                          <textarea
                            className="border rounded p-1 w-48"
                            value={reply}
                            onChange={e => setReply(e.target.value)}
                            placeholder="Type your reply..."
                          />
                          <div className="flex gap-2 mt-1">
                            <Button
                              size="sm"
                              onClick={() => handleReply(ticket._id)}
                              disabled={!reply.trim()}
                            >
                              Send
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReply("")
                                setReplyingTicketId(null)
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyingTicketId(ticket._id)}
                        >
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
