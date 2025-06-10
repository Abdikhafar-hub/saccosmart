"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Clock, Send, Ticket } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/components/ui/use-toast"

const supportTickets = [
  {
    id: "TKT-001",
    subject: "Unable to access loan application",
    category: "Technical",
    status: "In Progress",
    date: "2024-01-15",
    priority: "Medium",
  },
  {
    id: "TKT-002",
    subject: "Question about contribution calculation",
    category: "Financial",
    status: "Resolved",
    date: "2024-01-10",
    priority: "Low",
  },
]

export default function MemberSupportPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "",
    description: "",
  })
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)

  // Fetch member's own tickets
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:5000/api/support/my", {
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

  // Fetch user info on mount (similar to dashboard)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:5000/api/dashboard/member", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data.user)
      } catch (err) {
        // fallback: do nothing, user stays null
      }
    }
    fetchUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "http://localhost:5000/api/support",
        {
          ...formData,
          category: formData.category.toLowerCase(),
          priority: formData.priority.toLowerCase(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Show success notification
      toast({
        title: "Ticket Submitted Successfully",
        description: "The admin has received your concern and will respond to you shortly.",
        duration: 5000,
      })

      setFormData({ subject: "", category: "", priority: "", description: "" })
      
      // Refresh tickets
      const res = await axios.get("http://localhost:5000/api/support/my", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTickets(res.data)
    } catch (err) {
      // Show error notification
      toast({
        title: "Error",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
      setError("Failed to submit ticket")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading || !user) return <LoadingSpinner fullScreen />

  return (
    <DashboardLayout role="member" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground">Get help with your SACCO account or submit a support request.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>Get in touch with our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@saccosmart.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+254 700 123 456</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Support Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri: 8AM-5PM</p>
                  <p className="text-sm text-muted-foreground">Sat: 9AM-1PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Ticket Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Submit Support Ticket
              </CardTitle>
              <CardDescription>Describe your issue and we'll get back to you</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="financial">Financial Question</SelectItem>
                      <SelectItem value="account">Account Issue</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
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

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Please provide detailed information about your issue..."
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Your Support Tickets</CardTitle>
            <CardDescription>Track the status of your submitted support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner fullScreen />
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ticket.subject || ticket.title}</span>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Ticket ID: {ticket._id}</span>
                        <span>Date: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>Priority: {ticket.priority}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Status: </span>
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      </div>
                      {ticket.responses && ticket.responses.length > 0 && (
                        <div className="mt-2">
                          <span className="font-semibold">Admin Responses:</span>
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
