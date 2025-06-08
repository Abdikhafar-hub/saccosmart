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

export default function AdminDashboard() {
  // Top summary cards
  const { data: dashboardData, isLoading: loadingDashboard, error: errorDashboard } = useSWR(
    "http://localhost:5000/api/dashboard/admin", fetcher
  )
  // Contributions trend
  const { data: contributionsTrend, isLoading: loadingTrend } = useSWR(
    "http://localhost:5000/api/analytics/contributions-trend", fetcher
  )
  // Loan status distribution
  const { data: loanStatusData, isLoading: loadingLoanStatus } = useSWR(
    "http://localhost:5000/api/analytics/loan-status-distribution", fetcher
  )
  // System alerts
  const { data: alerts, isLoading: loadingAlerts } = useSWR(
    "http://localhost:5000/api/system/alerts", fetcher
  )
  // Recent activity
  const { data: recentActivities, isLoading: loadingActivity } = useSWR(
    "http://localhost:5000/api/system/activity", fetcher
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

  const fetchDashboardData = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const [statsRes, loansRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/admin/loans", {
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

  // Loading and error handling
  if (loadingDashboard || loadingTrend || loadingLoanStatus || loadingAlerts || loadingActivity || loading) {
    return <div>Loading...</div>
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

  const viewLoanDetails = (loanId: string) => {
    const loan = loans.find(l => l._id === loanId)
    if (loan) {
      toast({
        title: "Loan Details",
        description: `Viewing details for loan ${loanId}`,
      })
    }
  }

  return (
    <DashboardLayout role="admin" user={{ name: "Admin", email: "", role: "Admin" }}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your SACCO management system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Contributions Over Time"
            description="Monthly contribution trends"
            type="line"
            data={contributionsTrend}
            dataKey="value"
            xAxisKey="name"
          />
          <ChartCard
            title="Loan Status Distribution"
            description="Current loan portfolio breakdown"
            type="pie"
            data={loanStatusData}
            dataKey="value"
            xAxisKey="name"
          />
        </div>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              System Alerts
            </CardTitle>
            <CardDescription>Important notifications requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">{overdue.count} Overdue Loan Payments</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">Total amount: KES {overdue.totalAmount.toLocaleString()}</p>
                </div>
                <Badge variant="destructive">High Priority</Badge>
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

        {/* Recent Activity */}
        <DataTable
          data={recentActivities}
          columns={activityColumns}
          title="Recent System Activity"
          searchable={true}
          filterable={true}
          exportable={true}
          pageSize={5}
        />

        {/* Loan Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Applications</CardTitle>
          </CardHeader>
          <CardContent>
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
                      <Badge className={config.color} variant="secondary">
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
                      <Button size="sm" variant="outline" onClick={() => viewLoanDetails(row._id)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  ),
                },
              ]}
              title="Loan Applications"
              searchable={true}
              filterable={true}
              exportable={true}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
