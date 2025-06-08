"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { ChartCard } from "@/components/ui/chart-card"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  UserPlus,
  FileText,
  Mail,
  Phone,
  Edit,
  UserCheck,
  Send,
  Filter,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

interface Member {
  _id: string
  name: string
  email: string
  totalContributions?: number
  loanStatus?: string
  avatar?: string
  status?: string
  membershipType?: string
  phone?: string
  nationalId?: string
  joinDate?: string
  currentBalance?: number
  loanBalance?: number
  complianceRate?: number
  documents?: string[]
  referredBy?: string
  // Add any other fields you use in your table or profile modal
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<keyof Member>("name")
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [isApprovalOpen, setIsApprovalOpen] = useState(false)
  const [isBulkMessageOpen, setIsBulkMessageOpen] = useState(false)
  const [approvalData, setApprovalData] = useState({
    memberId: "",
    action: "",
    comments: "",
  })
  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationalId: "",
    address: "",
    membershipType: "",
    initialContribution: "",
  })
  const [bulkMessage, setBulkMessage] = useState({
    subject: "",
    message: "",
    recipients: "all",
  })
  const { toast } = useToast()

  // NEW: State for backend dashboard data
  const [dashboard, setDashboard] = useState<any>(null)

  // Add state for edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    joinDate: "",
    age: "",
  });

  const user = {
    name: "Admin User",
    email: "admin@saccosmart.com",
    role: "Admin",
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:5000/api/dashboard/members/full-summary", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setDashboard(res.data)
      } catch (err) {
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!dashboard) return null

  // Use dashboard.stats, dashboard.memberGrowthTrends, etc. everywhere below
  // All your UI, columns, dialogs, and actions remain unchanged

  // Update the active members count
  const activeMembersCount = dashboard.activeMembers.filter((member: Member) => member.status === "Active").length;

  const allColumns = [
    {
      key: "name",
      label: "Full Name",
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.avatar || "/placeholder.svg"} alt={row.name} />
            <AvatarFallback>
              {row.name.split(" ").map((word: string) => word[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-sm text-gray-500">{row._id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: any) => (
        <Badge className={value === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "hasLoanApplication",
      label: "Loan Participation",
      render: (value: any) => (value ? "Yes" : "No"),
    },
    {
      key: "lastContribution",
      label: "Last Contribution Date",
      render: (value: any) => (value ? new Date(value).toLocaleDateString() : "N/A"),
    },
    {
      key: "totalContributions",
      label: "Total Contributions",
      render: (value: any) => `KES ${value ? value.toLocaleString() : "0"}`,
    },
    {
      key: "totalLoanAmount",
      label: "Total Loan Amount",
      render: (value: any) => `KES ${value ? value.toLocaleString() : "0"}`,
    },
    {
      key: "view",
      label: "View",
      render: (value: any, row: any) => (
        <Button variant="link" onClick={() => setSelectedMember(row)}>
          <Eye className="h-8 w-8" />
        </Button>
      ),
    },
    {
      key: "edit",
      label: "Edit",
      render: (value: any, row: any) => (
        <Button variant="link" onClick={() => {
          setSelectedMember(row);
          setEditData({
            name: row.name,
            email: row.email,
            joinDate: row.joinDate ? new Date(row.joinDate).toISOString().split('T')[0] : "",
            age: row.dateOfBirth ? (new Date().getFullYear() - new Date(row.dateOfBirth).getFullYear()).toString() : "",
          });
          setIsEditOpen(true);
        }}>
          <Edit className="h-8 w-8" />
        </Button>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (value: any) => (
        <Button variant="link" onClick={() => window.location.href = `mailto:${value}`}>
          <Mail className="h-8 w-8" />
        </Button>
      ),
    },
  ];

  // Apply bold styling to table headers using CSS
  const tableHeaderStyle = "font-bold";

  // Function to handle saving changes
  const handleSaveChanges = async () => {
    if (!selectedMember) {
      toast({ title: "Error", description: "No member selected for editing." });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/members/${selectedMember._id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Success", description: "Member details updated successfully." });
      setIsEditOpen(false);
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({ title: "Error", description: error.response?.data || "Failed to update member details." });
      } else {
        toast({ title: "Error", description: "An unexpected error occurred." });
      }
    }
  };

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/dashboard/members/full-summary", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(res.data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin" user={user}>
      <style jsx global>{`
        th {
          font-weight: bold;
        }
      `}</style>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Member Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage SACCO members, applications, and membership data</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsBulkMessageOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Bulk Message
            </Button>
            <Button variant="outline" onClick={() => setIsRegistrationOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Members" value={dashboard.stats.totalMembers} description="All registered members" icon={Users} />
          <StatsCard title="Active Members" value={activeMembersCount} description={`${dashboard.stats.totalMembers > 0 ? Math.round((activeMembersCount / dashboard.stats.totalMembers) * 100) : 0}% of total`} icon={UserCheck} />
          <StatsCard title="Pending Approval" value={dashboard.stats.pendingApproval} description="Awaiting verification" icon={Clock} />
          <StatsCard title="New This Month" value={dashboard.stats.newThisMonth} description="Recent registrations" icon={TrendingUp} />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sacco-blue">
                KES {dashboard.stats.averageContribution.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Per member per month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Retention Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sacco-green">{dashboard.stats.retentionRate}%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">12-month retention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inactive Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboard.stats.inactiveMembers}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {dashboard.stats.totalMembers > 0 ? Math.round((dashboard.stats.inactiveMembers / dashboard.stats.totalMembers) * 100) : 0}% of total
              </p>
              <Button size="sm" className="mt-2" variant="outline">
                <Mail className="h-3 w-3 mr-1" />
                Send Reactivation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Member Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartCard
                  title=""
                  type="line"
                  data={dashboard.memberGrowthTrends}
                  dataKey="new"
                  xAxisKey="name"
                />
              </div>
            </CardContent>
          </Card>
          <ChartCard
            title="Membership Types"
            description="Distribution by membership category"
            type="pie"
            data={dashboard.membershipTypes}
            dataKey="value"
            xAxisKey="name"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Age Distribution"
            description="Members by age group"
            type="bar"
            data={dashboard.ageDistribution}
            dataKey="value"
            xAxisKey="name"
          />
          <ChartCard
            title="Member Status"
            description="Current member status breakdown"
            type="pie"
            data={dashboard.memberStatusDistribution}
            dataKey="value"
            xAxisKey="name"
          />
        </div>

        {/* Member Management Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="all">All Members ({dashboard.stats.totalMembers})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-6">
            <DataTable
              data={dashboard.activeMembers}
              columns={allColumns}
              searchable={true}
              filterable={true}
              exportable={true}
            />
          </TabsContent>
        </Tabs>

        {/* Member Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Member Details - {selectedMember?.name}</DialogTitle>
              <DialogDescription>Complete member information and account history</DialogDescription>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedMember.avatar || "/placeholder.svg"} alt={selectedMember.name} />
                    <AvatarFallback className="text-lg">
                      {selectedMember.name.split(" ").map((word) => word[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedMember.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedMember.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge
                        className={
                          selectedMember.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                        variant="secondary"
                      >
                        {selectedMember.status}
                      </Badge>
                      <Badge
                        className={
                          selectedMember.membershipType === "Premium"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }
                        variant="secondary"
                      >
                        {selectedMember.membershipType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Member ID:</span>
                        <span className="font-medium">{selectedMember._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span className="font-medium">{selectedMember.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>National ID:</span>
                        <span className="font-medium">{selectedMember.nationalId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Join Date:</span>
                        <span className="font-medium">
                          {selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Financial Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Current Balance:</span>
                        <span className="font-medium">KES {selectedMember.currentBalance?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Contributions:</span>
                        <span className="font-medium">KES {selectedMember.totalContributions?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Balance:</span>
                        <span className="font-medium">KES {selectedMember.loanBalance?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Rate:</span>
                        <span className="font-medium">{selectedMember.complianceRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedMember.documents && (
                  <div>
                    <h4 className="font-semibold mb-3">Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.documents.map((doc: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMember.referredBy && (
                  <div>
                    <h4 className="font-semibold mb-3">Referral Information</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMember.referredBy}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Member
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Member Registration Dialog */}
        <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New Member</DialogTitle>
              <DialogDescription>Add a new member to the SACCO system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={registrationData.firstName}
                    onChange={(e) => setRegistrationData({ ...registrationData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={registrationData.lastName}
                    onChange={(e) => setRegistrationData({ ...registrationData, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input
                    id="nationalId"
                    value={registrationData.nationalId}
                    onChange={(e) => setRegistrationData({ ...registrationData, nationalId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membershipType">Membership Type</Label>
                  <Select
                    value={registrationData.membershipType}
                    onValueChange={(value) => setRegistrationData({ ...registrationData, membershipType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select membership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={registrationData.address}
                  onChange={(e) => setRegistrationData({ ...registrationData, address: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialContribution">Initial Contribution (KES)</Label>
                <Input
                  id="initialContribution"
                  type="number"
                  value={registrationData.initialContribution}
                  onChange={(e) => setRegistrationData({ ...registrationData, initialContribution: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRegistrationOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {}} className="bg-sacco-blue hover:bg-sacco-blue/90">
                Register Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{approvalData.action === "approve" ? "Approve" : "Reject"} Member Application</DialogTitle>
              <DialogDescription>
                {approvalData.action === "approve"
                  ? "Approve this member application and grant access to SACCO services"
                  : "Reject this member application and provide a reason"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comments">
                  {approvalData.action === "approve" ? "Approval Notes" : "Rejection Reason"}
                </Label>
                <Textarea
                  id="comments"
                  placeholder={
                    approvalData.action === "approve"
                      ? "Add any notes for the approval..."
                      : "Provide reason for rejection..."
                  }
                  value={approvalData.comments}
                  onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApprovalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {}}
                className={
                  approvalData.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }
              >
                {approvalData.action === "approve" ? "Approve Member" : "Reject Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Message Dialog */}
        <Dialog open={isBulkMessageOpen} onOpenChange={setIsBulkMessageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Bulk Message</DialogTitle>
              <DialogDescription>Send a message to multiple members at once</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Select
                  value={bulkMessage.recipients}
                  onValueChange={(value) => setBulkMessage({ ...bulkMessage, recipients: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="active">Active Members Only</SelectItem>
                    <SelectItem value="inactive">Inactive Members Only</SelectItem>
                    <SelectItem value="pending">Pending Applications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={bulkMessage.subject}
                  onChange={(e) => setBulkMessage({ ...bulkMessage, subject: e.target.value })}
                  placeholder="Enter message subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={bulkMessage.message}
                  onChange={(e) => setBulkMessage({ ...bulkMessage, message: e.target.value })}
                  placeholder="Enter your message..."
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkMessageOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {}} className="bg-sacco-blue hover:bg-sacco-blue/90">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Member Details</DialogTitle>
              <DialogDescription>Update member information and save changes</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joinDate">Joining Date</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={editData.joinDate}
                    onChange={(e) => setEditData({ ...editData, joinDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Select
                    value={editData.age}
                    onValueChange={(value) => setEditData({ ...editData, age: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(100).keys()].map(age => (
                        <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSaveChanges()} className="bg-sacco-blue hover:bg-sacco-blue/90">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
