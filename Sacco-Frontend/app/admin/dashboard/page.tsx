"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { ChartCard } from "@/components/ui/chart-card"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CreditCard, Banknote, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { generatePDFReport } from "@/utils/reportGenerator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AdminDashboardData {
  members: { name: string; email: string }[]
  loans: { amount: number; status: string; date: string }[]
  contributions: { amount: number; date: string }[]
}

interface Loan {
  _id: string
  userId: string
  userName: string
  amount: number
  status: string
  date?: string
  term?: string
  purpose?: string
  balance?: number
  disbursedAmount?: number
  interestRate?: number
  monthlyPayment?: number
  nextDueDate?: string
  completedDate?: string
  rejectedDate?: string
  rejectionReason?: string
}

interface DashboardStats {
  totalMembers: number
  totalLoans: number
  totalContributions: number
  activeLoans: number
  pendingLoans: number
  totalLoanAmount: number
  totalContributionsAmount: number
}

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data)
}

// Add modal for viewing loan details
const LoanDetailsModal = ({ loan, isOpen, onClose }: { loan: Loan | null, isOpen: boolean, onClose: () => void }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Loan Details</DialogTitle>
        <DialogDescription>View complete loan information below.</DialogDescription>
      </DialogHeader>
      {loan && (
        <div className="space-y-4">
          <div>
            <Label>Date Applied</Label>
            <p>{loan.date ? new Date(loan.date).toLocaleDateString() : "N/A"}</p>
          </div>
          <div>
            <Label>Loan Amount</Label>
            <p>KES {loan.amount.toLocaleString()}</p>
          </div>
          <div>
            <Label>Repayment Plan</Label>
            <p>{loan.term || "N/A"}</p>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export default function AdminDashboard() {
  // Top summary cards
  const { data: dashboardData, isLoading: loadingDashboard, error: errorDashboard } = useSWR(
    "https://saccosmart.onrender.com/api/dashboard/admin", fetcher
  )
  // Contributions trend
  const { data: contributionsTrend, isLoading: loadingTrend } = useSWR(
    "https://saccosmart.onrender.com/api/analytics/contributions-trend", fetcher
  )
  // Loan status distribution
  const { data: loanStatusData, isLoading: loadingLoanStatus } = useSWR(
    "https://saccosmart.onrender.com/api/analytics/loan-status-distribution", fetcher
  )
  // System alerts
  const { data: alerts, isLoading: loadingAlerts } = useSWR(
    "https://saccosmart.onrender.com/api/system/alerts", fetcher
  )
  // Recent activity
  const { data: recentActivities, isLoading: loadingActivity } = useSWR(
    "https://saccosmart.onrender.com/api/system/activity", fetcher
  )

  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalLoans: 0,
    totalContributions: 0,
    activeLoans: 0,
    pendingLoans: 0,
    totalLoanAmount: 0,
    totalContributionsAmount: 0,
  })
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const fetchDashboardData = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const [statsRes, loansRes] = await Promise.all([
        axios.get("https://saccosmart.onrender.com/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("https://saccosmart.onrender.com/api/admin/loans", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      setStats(statsRes.data)
      setLoans(loansRes.data.loans || [])
    } catch (err) {
      setError("Failed to load dashboard data")
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      const blob = await generatePDFReport()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `saccosmart-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast({
        title: "Report Generated",
        description: "Your report has been downloaded successfully.",
      })
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Loading and error handling
  if (loadingDashboard || loadingTrend || loadingLoanStatus || loadingAlerts || loadingActivity || loading) {
    return <LoadingSpinner fullScreen />
  }

  if (errorDashboard || error) {
    return <div className="text-red-500">Failed to load dashboard data</div>
  }

  if (!dashboardData || !contributionsTrend || !loanStatusData || !alerts || !recentActivities) {
    return null
  }

  // Top cards
  const totalUsers = dashboardData.members.length
  const totalSavings = dashboardData.contributions.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
  const outstandingLoans = dashboardData.loans
    .filter((l: any) => l.status === "approved" || l.status === "active")
    .reduce((sum: number, l: any) => sum + (l.amount || 0), 0)
  const monthlyGrowth = dashboardData.monthlyGrowth

  // System alerts
  const overdue = alerts.overdueLoans
  const pending = alerts.pendingLoans
  const lastBackup = alerts.lastBackup

  // Activity columns (unchanged)
  const activityColumns = [
    {
      key: "user",
      label: "User",
      sortable: true,
    },
    {
      key: "action",
      label: "Action",
      sortable: true,
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: string) => (value !== "-" ? value : "-"),
    },
    {
      key: "time",
      label: "Time",
      sortable: true,
    },
    {
      key: "type",
      label: "Type",
      render: (value: string) => {
        const colors = {
          contribution: "bg-green-100 text-green-800",
          loan: "bg-blue-100 text-blue-800",
          payment: "bg-purple-100 text-purple-800",
          profile: "bg-gray-100 text-gray-800",
          other: "bg-gray-100 text-gray-800",
        }
        return (
          <Badge className={colors[value as keyof typeof colors] || "bg-gray-100 text-gray-800"} variant="secondary">
            {value}
          </Badge>
        )
      },
    },
  ]

  const handleViewLoanDetails = (loanId: string) => {
    const loan = loans.find(l => l._id === loanId)
    if (loan) {
      setSelectedLoan(loan)
      setIsModalOpen(true)
    }
  }

  // Update StatsCard styling
  const StatsCard = ({ title, value, description, icon: Icon, trend }: any) => (
    <div className="bg-white shadow-md rounded-xl p-4 flex items-center space-x-4">
      <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
        <Icon className="h-6 w-6 text-blue-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
        {trend && (
          <p className={`text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last month
          </p>
        )}
      </div>
    </div>
  )

  return (
    <DashboardLayout role="admin" user={{ name: "Admin", email: "", role: "Admin" }}>
      <div className="space-y-6 px-2 sm:px-4 md:px-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Overview of your SACCO management system</p>
          </div>
          <Button onClick={handleGenerateReport} className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600">
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={totalUsers.toLocaleString()}
            description="Active SACCO members"
            icon={Users}
            trend={{ value: 8, isPositive: true }} // Optionally, replace with backend trend if available
          />
          <StatsCard
            title="Total Savings"
            value={`KES ${totalSavings.toLocaleString()}`}
            description="All member contributions"
            icon={CreditCard}
            trend={{ value: 15, isPositive: true }} // Optionally, replace with backend trend if available
          />
          <StatsCard
            title="Outstanding Loans"
            value={`KES ${outstandingLoans.toLocaleString()}`}
            description="Active loan portfolio"
            icon={Banknote}
            trend={{ value: -3, isPositive: false }} // Optionally, replace with backend trend if available
          />
          <StatsCard
            title="Monthly Growth"
            value={`${monthlyGrowth}%`}
            description="Member growth rate"
            icon={TrendingUp}
            trend={{ value: monthlyGrowth, isPositive: monthlyGrowth >= 0 }}
          />
        </div>

        {/* Charts and Tables Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Charts */}
          <div className="lg:col-span-2 overflow-x-auto rounded-lg">
            <div className="border border-[#E0EFFF] rounded-lg p-2 sm:p-4 min-w-[320px]">
              <ChartCard
                title="Contributions Over Time"
                description="Monthly contribution trends"
                type="line"
                data={contributionsTrend}
                dataKey="value"
                xAxisKey="name"
              />
            </div>
          </div>
          <div className="lg:col-span-1 overflow-x-auto rounded-lg">
            <div className="border border-[#E0EFFF] rounded-lg p-2 sm:p-4 min-w-[320px]">
              <ChartCard
                title="Loan Status Distribution"
                description="Current loan portfolio breakdown"
                type="pie"
                data={loanStatusData}
                dataKey="value"
                xAxisKey="name"
              />
            </div>
          </div>

          {/* System Alerts */}
          <div className="lg:col-span-3 overflow-x-auto rounded-lg">
            <div className="border border-[#E0EFFF] rounded-lg p-2 sm:p-4 min-w-[320px]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-500 animate-pulse" />
                    System Alerts
                  </CardTitle>
                  <CardDescription>Important notifications requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <h4 className="font-medium text-red-800">{overdue.count} Overdue Loan Payments</h4>
                        <p className="text-sm text-red-600">Total amount: KES {overdue.totalAmount.toLocaleString()}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800 animate-pulse" variant="destructive">High Priority</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">{pending.count} Pending Loan Applications</h4>
                        <p className="text-sm text-yellow-600 dark:text-yellow-300">Awaiting approval</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
                        Medium Priority
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">System Backup Completed</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300">Last backup: {lastBackup ? new Date(lastBackup).toLocaleString() : "N/A"}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800" variant="secondary">
                        Info
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-3 overflow-x-auto rounded-lg">
            <div className="border border-[#E0EFFF] rounded-lg p-2 sm:p-4 min-w-[320px]">
              <DataTable
                data={recentActivities}
                columns={activityColumns}
                title="Recent System Activity"
                searchable={true}
                filterable={true}
                exportable={true}
                pageSize={5}
              />
            </div>
          </div>

          {/* Loan Applications */}
          <div className="lg:col-span-3 overflow-x-auto rounded-lg">
            <div className="border border-[#E0EFFF] rounded-lg p-2 sm:p-4 min-w-[320px]">
              <h2 className="text-2xl font-bold text-gray-800">Loan Applications</h2>
              <DataTable
                data={loans}
                columns={[
                  {
                    key: "_id",
                    label: "Loan ID",
                    sortable: true,
                  },
                  {
                    key: "userName",
                    label: "Member",
                    sortable: true,
                  },
                  {
                    key: "amount",
                    label: "Amount",
                    sortable: true,
                    render: (value: number) => `KES ${value.toLocaleString()}`,
                  },
                  {
                    key: "term",
                    label: "Term",
                  },
                  {
                    key: "date",
                    label: "Applied Date",
                    sortable: true,
                    render: (value: string | undefined) =>
                      value ? new Date(value).toLocaleDateString() : "N/A",
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (value: string) => {
                      const statusConfig = {
                        pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
                        approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
                        rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
                        active: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
                        completed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
                      }
                      const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending
                      const Icon = config.icon
                      return (
                        <Badge className={`${config.color} rounded-full`} variant="secondary">
                          <Icon className="h-3 w-3 mr-1" />
                          {value}
                        </Badge>
                      )
                    },
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (value: any, row: any) => (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewLoanDetails(row._id)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    ),
                  },
                ]}
                searchable={true}
                filterable={true}
                exportable={true}
              />
            </div>
          </div>
        </div>

        {/* Loan Details Modal */}
        <LoanDetailsModal loan={selectedLoan} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </DashboardLayout>
  )
}
