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
import { Progress } from "@/components/ui/progress"
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
  CreditCard,
  Plus,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  FileText,
  Mail,
  Upload,
  Smartphone,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Contribution {
  _id: string
  user: { name: string; email: string }
  amount: number
  date: string
  status: string
  method?: string
  mpesaCode?: string
  bankRef?: string
  contributionType?: string
  verifiedBy?: string
  verifiedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  reference?: string
}

export default function AdminContributions() {
  const [selectedContribution, setSelectedContribution] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isVerificationOpen, setIsVerificationOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false)
  const [manualEntryData, setManualEntryData] = useState({
    memberId: "",
    amount: "",
    method: "",
    reference: "",
  })
  const [verificationData, setVerificationData] = useState<{
    contributionId: string
    action: "" | "verify" | "reject"
    comments: string
    adjustedAmount: string
  }>({
    contributionId: "",
    action: "",
    comments: "",
    adjustedAmount: "",
  })
  const { toast } = useToast()
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const user = {
    name: "Admin User",
    email: "admin@saccosmart.com",
    role: "Admin",
  }

  // Fetch all contributions from backend
  const fetchContributions = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:5000/api/contribution/all", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setContributions(res.data)
    } catch (err) {
      setError("Failed to load contributions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContributions()
  }, [])

  // Approve/reject handlers
  const handleVerification = async (id?: string, action?: "approve" | "reject", event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (id && action) {
      try {
        const token = localStorage.getItem("token");
        if (action === "approve") {
          await axios.put(
            `http://localhost:5000/api/contribution/approve/${id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else if (action === "reject") {
          await axios.put(
            `http://localhost:5000/api/contribution/reject/${id}`,
            { rejectionReason: "Rejected by admin" },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        fetchContributions();
      } catch (err) {
        setError(`Failed to ${action} contribution`)
      }
    }
  }

  // All calculations should use backend data
  const totalContributions = contributions.filter(c => c.status === "Verified").reduce((sum, c) => sum + (c.amount || 0), 0)
  const pendingVerifications = contributions.filter(c => c.status === "Pending").length
  const activeContributors = new Set(contributions.filter(c => c.status === "Verified").map(c => c.user?._id || c.user)).size
  const monthlyTarget = 500000 // or fetch from backend if dynamic
  const currentMonth = new Date().getMonth()
  const monthlyActual = contributions.filter(c => c.status === "Verified" && new Date(c.date).getMonth() === currentMonth).reduce((sum, c) => sum + (c.amount || 0), 0)
  const monthlyProgress = monthlyTarget > 0 ? Math.round((monthlyActual / monthlyTarget) * 100) : 0
  const averageContribution = contributions.filter(c => c.status === "Verified").length > 0
    ? Math.round(totalContributions / contributions.filter(c => c.status === "Verified").length)
    : 0

  // Example: Monthly trends (group by month)
  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const month = new Date().getMonth() - (5 - i)
    const value = contributions
      .filter(c => new Date(c.date).getMonth() === ((month + 12) % 12))
      .reduce((sum, c) => sum + (c.amount || 0), 0)
    return { name: new Date(0, (month + 12) % 12).toLocaleString('default', { month: 'short' }), value }
  })

  // Example: Contribution methods
  const methodCounts: Record<string, number> = {}
  contributions.forEach(c => {
    const method = c.method || "Other"
    methodCounts[method] = (methodCounts[method] || 0) + 1
  })
  const memberCategories = Object.entries(methodCounts).map(([name, value]) => ({ name, value }))

  // Table columns (customize as needed)
  const columns = [
    { key: "user", label: "Member", render: (v: any, row: any) => row.user?.name || "N/A" },
    { key: "amount", label: "Amount", render: (v: number) => `KES ${v?.toLocaleString()}` },
    { key: "method", label: "Method" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date", render: (v: string) => v && !isNaN(Date.parse(v)) ? new Date(v).toLocaleString() : "N/A" },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => viewContributionDetails(row)}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => handleVerification(row._id, "approve")}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Verify
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleVerification(row._id, "reject")}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ]

  const complianceRate = 0 // No logic yet, so always 0

  if (loading) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500">{error}</div>

  // Filter contributions by status
  const pendingContributions = contributions.filter(c => c.status === "Pending")
  const verifiedContributions = contributions.filter(c => c.status === "Verified")
  const rejectedContributions = contributions.filter(c => c.status === "Rejected")

  const pendingColumns = [
    {
      key: "member",
      label: "Member",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">{row.memberId}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) => `KES ${value.toLocaleString()}`,
    },
    {
      key: "method",
      label: "Method",
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-gray-500">
            {row.mpesaCode && `M-Pesa: ${row.mpesaCode}`}
            {row.bankRef && `Ref: ${row.bankRef}`}
          </p>
        </div>
      ),
    },
    {
      key: "contributionType",
      label: "Type",
      render: (value: string) => (
        <Badge
          className={
            value === "Monthly"
              ? "bg-blue-100 text-blue-800"
              : value === "Additional"
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
          }
          variant="secondary"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "timestamp",
      label: "Date & Time",
      sortable: true,
      render: (value: string) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{new Date(value).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          {value}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => viewContributionDetails(row)}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => handleVerification(row._id, "approve")}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Verify
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleVerification(row._id, "reject")}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ]

  const verifiedColumns = [
    {
      key: "member",
      label: "Member",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">{row.memberId}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) => `KES ${value.toLocaleString()}`,
    },
    {
      key: "method",
      label: "Method",
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-gray-500">
            {row.mpesaCode && `M-Pesa: ${row.mpesaCode}`}
            {row.bankRef && `Ref: ${row.bankRef}`}
          </p>
        </div>
      ),
    },
    {
      key: "contributionType",
      label: "Type",
      render: (value: string) => (
        <Badge
          className={
            value === "Monthly"
              ? "bg-blue-100 text-blue-800"
              : value === "Additional"
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
          }
          variant="secondary"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "verifiedAt",
      label: "Verified",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">by {row.verifiedBy}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge className="bg-green-100 text-green-800" variant="secondary">
          <CheckCircle className="h-3 w-3 mr-1" />
          {value}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => viewContributionDetails(row)}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => downloadReceipt(row.id)}>
            <Download className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ]

  const memberSummaryColumns = [
    {
      key: "memberName",
      label: "Member",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">{row.memberId}</p>
        </div>
      ),
    },
    {
      key: "monthlyTarget",
      label: "Monthly Target",
      sortable: true,
      render: (value: number) => `KES ${value.toLocaleString()}`,
    },
    {
      key: "currentMonth",
      label: "Current Month",
      sortable: true,
      render: (value: number, row: any) => (
        <div>
          <p className="font-medium">KES {value.toLocaleString()}</p>
          <Progress value={(value / row.monthlyTarget) * 100} className="h-1 mt-1" />
        </div>
      ),
    },
    {
      key: "totalContributions",
      label: "Total Contributions",
      sortable: true,
      render: (value: number) => `KES ${value.toLocaleString()}`,
    },
    {
      key: "lastContribution",
      label: "Last Contribution",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const statusConfig = {
          Current: { color: "bg-green-100 text-green-800", icon: CheckCircle },
          Overdue: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
          "Grace Period": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
        }
        const config = statusConfig[value as keyof typeof statusConfig]
        const Icon = config.icon
        return (
          <Badge className={config.color} variant="secondary">
            <Icon className="h-3 w-3 mr-1" />
            {value}
          </Badge>
        )
      },
    },
    {
      key: "complianceRate",
      label: "Compliance",
      sortable: true,
      render: (value: number) => (
        <div className="text-center">
          <p className="font-medium">{value}%</p>
          <Progress value={value} className="h-1 mt-1" />
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => viewMemberHistory(row.memberId)}>
            <Eye className="h-3 w-3 mr-1" />
            History
          </Button>
          <Button size="sm" variant="outline" onClick={() => contactMember(row.memberId)}>
            <Mail className="h-3 w-3 mr-1" />
            Contact
          </Button>
        </div>
      ),
    },
  ]

  const viewContributionDetails = (contribution: any) => {
    setSelectedContribution(contribution)
    setIsDetailsOpen(true)
  }

  const openVerificationDialog = (contribution: any, action: "verify" | "reject") => {
    setVerificationData({
      contributionId: contribution._id,
      action,
      comments: "",
      adjustedAmount: contribution.amount.toString(),
    })
    setIsVerificationOpen(true)
  }

  const bulkVerify = () => {
    toast({
      title: "Bulk Verification",
      description: "Selected contributions have been verified",
    })
  }

  const bulkReject = () => {
    toast({
      title: "Bulk Rejection",
      description: "Selected contributions have been rejected",
      variant: "destructive",
    })
  }

  const downloadReceipt = (contributionId: string) => {
    toast({
      title: "Download Started",
      description: `Downloading receipt for contribution ${contributionId}`,
    })
  }

  const viewMemberHistory = (memberId: string) => {
    toast({
      title: "Member History",
      description: `Viewing contribution history for member ${memberId}`,
    })
  }

  const contactMember = (memberId: string) => {
    toast({
      title: "Contact Member",
      description: `Opening contact options for member ${memberId}`,
    })
  }

  const handleBulkUpload = () => {
    toast({
      title: "Bulk Upload",
      description: "Contribution data has been uploaded successfully",
    })
    setIsBulkUploadOpen(false)
  }

  const handleManualEntry = async () => {
    try {
      const token = localStorage.getItem("token")
      // Send the new contribution to the backend
      await axios.post(
        "http://localhost:5000/api/contribution",
        {
          memberId: manualEntryData.memberId,
          amount: Number(manualEntryData.amount),
          method: manualEntryData.method,
          reference: manualEntryData.reference,
          // Add other fields as needed
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    toast({
      title: "Manual Entry Added",
      description: `Contribution of KES ${manualEntryData.amount} has been added for member ${manualEntryData.memberId}`,
    })
    setIsManualEntryOpen(false)
    setManualEntryData({ memberId: "", amount: "", method: "", reference: "" })
      // Refresh contributions
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/contribution/all", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setContributions(res.data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add manual contribution",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = () => {
    toast({
      title: "Generating Report",
      description: "Contribution report is being generated...",
    })

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: "Monthly contribution report has been downloaded successfully",
      })
    }, 2000)
  }

  const sendReminders = () => {
    toast({
      title: "Reminders Sent",
      description: "Contribution reminders have been sent to overdue members",
    })
  }

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contribution Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor and manage member contributions and verification</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button variant="outline" onClick={handleGenerateReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button className="bg-sacco-blue hover:bg-sacco-blue/90" onClick={() => setIsManualEntryOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex gap-3 items-center">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Contributions</p>
              <p className="text-xl font-bold text-gray-800">KES {totalContributions.toLocaleString()}</p>
              <p className="text-xs text-green-500">All time contributions</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex gap-3 items-center">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Progress</p>
              <p className="text-xl font-bold text-gray-800">{monthlyProgress}%</p>
              <p className="text-xs text-green-500">KES {monthlyActual.toLocaleString()} of {monthlyTarget.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex gap-3 items-center">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Verifications</p>
              <p className="text-xl font-bold text-gray-800">{pendingVerifications}</p>
              <p className="text-xs text-red-500">Awaiting verification</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex gap-3 items-center">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Contributors</p>
              <p className="text-xl font-bold text-gray-800">{activeContributors}</p>
              <p className="text-xs text-green-500">This month</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex gap-3 items-center">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Contribution</p>
              <p className="text-xl font-bold text-gray-800">KES {averageContribution.toLocaleString()}</p>
              <p className="text-xs text-green-500">Per member per month</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex gap-3 items-center">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Compliance Rate</p>
              <p className="text-xl font-bold text-gray-800">{complianceRate}%</p>
              <p className="text-xs text-green-500">Members meeting targets</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex gap-3 items-center">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Target</p>
              <p className="text-xl font-bold text-gray-800">KES {monthlyTarget.toLocaleString()}</p>
              <p className="text-xs text-green-500">Current month target</p>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sacco-blue">
                KES {averageContribution.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Per member per month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sacco-green">84.6%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Members meeting targets</p>
              <Progress value={84.6} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                KES {monthlyTarget.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current month target</p>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{monthlyProgress}%</span>
                </div>
                <Progress value={monthlyProgress} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Contribution Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartCard
                  title=""
                  type="line"
                  data={monthlyTrends}
                  dataKey="value"
                  xAxisKey="name"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Member Categories</CardTitle>
            </CardHeader>
            <CardContent>
          <ChartCard
            title="Member Categories"
            description="Distribution by membership type"
            type="pie"
            data={memberCategories}
            dataKey="value"
            xAxisKey="name"
          />
              {memberCategories.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={sendReminders} className="w-full justify-between bg-orange-600 hover:bg-orange-700">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Contribution Reminders
                </div>
                <span className="text-sm">0 overdue</span>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Monthly Report
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  M-Pesa Integration Status
                </div>
                <Badge className="bg-green-100 text-green-800" variant="secondary">
                  Active
                </Badge>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Management Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Verification ({pendingContributions.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({verifiedContributions.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedContributions.length})</TabsTrigger>
            <TabsTrigger value="members">Member Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pending Contribution Verifications</h3>
              <div className="flex space-x-2">
                <Button onClick={bulkVerify} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Bulk Verify
                </Button>
                <Button onClick={bulkReject} variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Bulk Reject
                </Button>
              </div>
            </div>
            <DataTable
              data={pendingContributions}
              columns={pendingColumns}
              searchable={true}
              filterable={true}
              exportable={true}
            />
          </TabsContent>

          <TabsContent value="verified" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Verified Contributions</h3>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Verified
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Receipts
                </Button>
              </div>
            </div>
            <DataTable
              data={verifiedContributions}
              columns={verifiedColumns}
              searchable={true}
              filterable={true}
              exportable={true}
            />
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Rejected Contributions</h3>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Rejected
              </Button>
            </div>
            <DataTable
              data={rejectedContributions}
              columns={[
                ...verifiedColumns.slice(0, -2),
                {
                  key: "rejectionReason",
                  label: "Rejection Reason",
                  render: (value: string) => (
                    <p className="text-sm text-red-600 max-w-xs truncate" title={value}>
                      {value}
                    </p>
                  ),
                },
                {
                  key: "actions",
                  label: "Actions",
                  render: (value: any, row: any) => (
                    <Button size="sm" variant="outline" onClick={() => viewContributionDetails(row)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  ),
                },
              ]}
              searchable={true}
              filterable={true}
              exportable={true}
            />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Member Contribution Summary</h3>
              <div className="flex space-x-2">
                <Button onClick={sendReminders} variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reminders
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Summary
                </Button>
              </div>
            </div>
            <DataTable
              data={contributions}
              columns={memberSummaryColumns}
              searchable={true}
              filterable={true}
              exportable={true}
            />
          </TabsContent>
        </Tabs>

        {/* Contribution Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contribution Details - {selectedContribution?._id}</DialogTitle>
              <DialogDescription>Complete contribution information and verification details</DialogDescription>
            </DialogHeader>
            {selectedContribution && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Transaction Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Transaction ID:</span>
                        <span className="font-medium">{selectedContribution._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">KES {selectedContribution.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="font-medium">{selectedContribution.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reference:</span>
                        <span className="font-medium">
                          {selectedContribution.mpesaCode || selectedContribution.bankRef}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{selectedContribution.contributionType}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Member Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-medium">{selectedContribution.user?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-medium">{selectedContribution.user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">{new Date(selectedContribution.date).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Reference Note</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {selectedContribution.reference}
                  </p>
                </div>
                {selectedContribution.verifiedBy && (
                  <div>
                    <h4 className="font-semibold mb-3">Verification Details</h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-gray-600 dark:text-gray-400">Verified by:</span>{" "}
                        {selectedContribution.verifiedBy}
                      </p>
                      <p>
                        <span className="text-gray-600 dark:text-gray-400">Verified at:</span>{" "}
                        {new Date(selectedContribution.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {selectedContribution.rejectionReason && (
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">Rejection Reason</h4>
                    <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      {selectedContribution.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Verification Dialog */}
        <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{verificationData.action === "verify" ? "Verify" : "Reject"} Contribution</DialogTitle>
              <DialogDescription>
                {verificationData.action === "verify"
                  ? "Confirm the contribution details and verify the transaction"
                  : "Provide reason for rejecting this contribution"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {verificationData.action === "verify" && (
                <div className="space-y-2">
                  <Label htmlFor="adjustedAmount">Verified Amount (KES)</Label>
                  <Input
                    id="adjustedAmount"
                    type="number"
                    value={verificationData.adjustedAmount}
                    onChange={(e) => setVerificationData({ ...verificationData, adjustedAmount: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Adjust amount if different from submitted amount</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="comments">
                  {verificationData.action === "verify" ? "Verification Notes" : "Rejection Reason"}
                </Label>
                <Textarea
                  id="comments"
                  placeholder={
                    verificationData.action === "verify"
                      ? "Add any notes for the verification..."
                      : "Provide reason for rejection..."
                  }
                  value={verificationData.comments}
                  onChange={(e) => setVerificationData({ ...verificationData, comments: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVerificationOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleVerification()}
                className={
                  verificationData.action === "verify"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {verificationData.action === "verify" ? "Verify Contribution" : "Reject Contribution"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upload Contributions</DialogTitle>
              <DialogDescription>Upload multiple contributions from a CSV or Excel file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your file here, or click to browse
                </p>
                <Button variant="outline">Choose File</Button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">File Requirements:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Supported formats: CSV, Excel (.xlsx)</li>
                  <li>• Required columns: Member ID, Amount, Date, Method, Reference</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Maximum 1000 records per upload</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkUpload} className="bg-sacco-blue hover:bg-sacco-blue/90">
                Upload Contributions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manual Entry Dialog */}
        <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manual Contribution Entry</DialogTitle>
              <DialogDescription>Add a contribution manually to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memberId">Member ID</Label>
                <Input
                  id="memberId"
                  placeholder="Enter member ID (e.g., MEM001)"
                  value={manualEntryData.memberId}
                  onChange={(e) => setManualEntryData({ ...manualEntryData, memberId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter contribution amount"
                  value={manualEntryData.amount}
                  onChange={(e) => setManualEntryData({ ...manualEntryData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <select
                  id="method"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={manualEntryData.method}
                  onChange={(e) => setManualEntryData({ ...manualEntryData, method: e.target.value })}
                >
                  <option value="">Select payment method</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference/Notes</Label>
                <Textarea
                  id="reference"
                  placeholder="Add any reference notes..."
                  value={manualEntryData.reference}
                  onChange={(e) => setManualEntryData({ ...manualEntryData, reference: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsManualEntryOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleManualEntry} className="bg-sacco-blue hover:bg-sacco-blue/90">
                Add Contribution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
