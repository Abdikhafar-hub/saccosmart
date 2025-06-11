"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@//components/ui/stats-card"
import { ChartCard } from "@/components/ui/chart-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Banknote, TrendingUp, Calendar, Bell, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import axios from "axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DashboardData {
  user: { name: string; email: string; role: string }
  contributions: { amount: number; date: string }[]
  loans: { amount: number; status: string; date: string }[]
  // Add new fields from backend response:
  totalContributions?: number; // May still be calculated on frontend, depending on need
  totalContributionsTrend?: number;
  activeLoanBalance?: number;
  activeLoanTrend?: number;
  isLoanTrendPositive?: boolean;
  monthlyTargetAmount?: number;
  currentMonthContributed?: number;
  monthlyProgressPercentage?: number;
  nextDueDate?: string; // Assuming string format from backend for simplicity
  nextDueDateDescription?: string;
}

export default function MemberDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        // Updated endpoint to fetch more stats
        const res = await axios.get("https://saccosmart.onrender.com/api/dashboard/member", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setDashboardData(res.data)
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error("Failed to fetch member dashboard data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500">{error}</div>
  if (!dashboardData || !dashboardData.user) return null

  // Calculations using fetched data
  // Note: Some calculations are now done on the backend and returned directly.
  // Keep frontend calculations if needed for charting/local manipulation.
  const totalContributions = dashboardData.totalContributions !== undefined ? dashboardData.totalContributions : dashboardData.contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalContributionsTrend = dashboardData.totalContributionsTrend !== undefined ? dashboardData.totalContributionsTrend : 0; // Use backend trend

  const activeLoanBalance = dashboardData.activeLoanBalance !== undefined ? dashboardData.activeLoanBalance : dashboardData.loans.filter(l => l.status === "approved" || l.status === "active").reduce((sum, l) => sum + (l.amount || 0), 0);

  // Determine if the user has ever borrowed a loan
  const hasLoanHistory = dashboardData.loans && dashboardData.loans.length > 0;
  const hasActiveLoan = activeLoanBalance > 0;

  // If no loan history, trend is 0
  const activeLoanTrend = (!hasLoanHistory || !hasActiveLoan) ? 0 : (dashboardData.activeLoanTrend !== undefined ? dashboardData.activeLoanTrend : 0);
  const isLoanTrendPositive = (!hasLoanHistory || !hasActiveLoan) ? true : (dashboardData.isLoanTrendPositive !== undefined ? dashboardData.isLoanTrendPositive : false);

  const monthlyTargetAmount = dashboardData.monthlyTargetAmount !== undefined ? dashboardData.monthlyTargetAmount : 50000; // Use backend target
  const currentMonthContributed = dashboardData.currentMonthContributed !== undefined ? dashboardData.currentMonthContributed : dashboardData.contributions.filter(c => new Date(c.date).getMonth() === new Date().getMonth()).reduce((sum, c) => sum + (c.amount || 0), 0);
  const monthlyProgressPercentage = dashboardData.monthlyProgressPercentage !== undefined ? dashboardData.monthlyProgressPercentage : (monthlyTargetAmount === 0 ? 0 : (currentMonthContributed / monthlyTargetAmount) * 100);

  const nextDueDate = dashboardData.nextDueDate || null; // Use backend due date
  const nextDueDateDescription = dashboardData.nextDueDateDescription || "Loan payment due"; // Use backend description
  const formattedNextDueDate = nextDueDate ? new Date(nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';

  // Monthly chart data (still calculated on frontend based on the fetched contributions array)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthlyContributionsChartData = Array.from({ length: 6 }, (_, i) => {
    const monthIdx = (new Date().getMonth() - 5 + i + 12) % 12
    const value = (dashboardData.contributions || []) // Use fetched contributions
      .filter(c => new Date(c.date).getMonth() === monthIdx)
      .reduce((sum, c) => sum + (c.amount || 0), 0)
    return { name: months[monthIdx], value }
  })

  // Quick action handlers
  const handleMakeContribution = () => {
    router.push("/member/contributions")
  }

  const handleApplyForLoan = () => {
    router.push("/member/loans")
  }

  const handleViewStatements = () => {
    router.push("/member/reports")
  }

  const handleDownloadReports = () => {
    toast({
      title: "Download Started",
      description: "Your monthly report is being generated...",
    })
    // Simulate download
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Your report has been downloaded successfully",
      })
    }, 2000)
  }

  // Enhance Dashboard Cards styling
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
    <DashboardLayout role="member" user={dashboardData.user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {dashboardData.user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Here's an overview of your SACCO account</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Savings"
            value={`KES ${totalContributions.toLocaleString()}`}
            description="Your total contributions"
            icon={CreditCard}
            trend={{ value: totalContributionsTrend, isPositive: totalContributionsTrend >= 0 }}
          />
          <StatsCard
            title="Active Loan"
            value={`KES ${activeLoanBalance.toLocaleString()}`}
            description="Current loan balance"
            icon={Banknote}
            trend={{ value: activeLoanTrend, isPositive: isLoanTrendPositive }}
          />
          <StatsCard
            title="Monthly Target"
            value={`${monthlyProgressPercentage.toFixed(0)}%`}
            description={`KES ${currentMonthContributed.toLocaleString()} of KES ${monthlyTargetAmount.toLocaleString()}`}
            icon={TrendingUp}
          />
          <StatsCard
            title="Next Due Date"
            value={formattedNextDueDate}
            description={nextDueDateDescription}
            icon={Calendar}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Contributions Chart */}
          <div className="lg:col-span-2">
            <div className="border border-[#E0EFFF] rounded-lg p-4">
              <ChartCard
                title="Monthly Contributions"
                description="Your contribution history over the last 6 months"
                type="bar"
                data={monthlyContributionsChartData}
                dataKey="value"
                xAxisKey="name"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg shadow-md hover:bg-[#F3F4F6] cursor-pointer p-4">
                <Button
                  className="w-full justify-between bg-sacco-blue hover:bg-sacco-blue/90"
                  onClick={handleMakeContribution}
                >
                  Make Contribution
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="rounded-lg shadow-md hover:bg-[#F3F4F6] cursor-pointer p-4">
                <Button variant="outline" className="w-full justify-between" onClick={handleApplyForLoan}>
                  Apply for Loan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="rounded-lg shadow-md hover:bg-[#F3F4F6] cursor-pointer p-4">
                <Button variant="outline" className="w-full justify-between" onClick={handleViewStatements}>
                  View Statements
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="rounded-lg shadow-md hover:bg-[#F3F4F6] cursor-pointer p-4">
                <Button variant="outline" className="w-full justify-between" onClick={handleDownloadReports}>
                  Download Reports
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Contribution Progress */}
          <Card className="shadow-md rounded-lg">
            <CardHeader>
              <CardTitle>Monthly Contribution Progress</CardTitle>
              <CardDescription>Track your progress towards monthly target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Month</span>
                  <span>KES {currentMonthContributed.toLocaleString()} / KES {monthlyTargetAmount.toLocaleString()}</span>
                </div>
                <Progress value={monthlyProgressPercentage} className="h-2 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Contributed</p>
                  <p className="font-semibold text-green-600">KES {currentMonthContributed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Remaining</p>
                  <p className="font-semibold text-orange-600">KES {(monthlyTargetAmount - currentMonthContributed).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="border border-blue-500 rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Financial Tips & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Welcome to Your Financial Journey!</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    We're here to help you achieve your financial goals. Here are some tips to maximize your SACCO benefits:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Regular contributions build your savings faster and increase your loan eligibility
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Consider setting up automatic contributions to maintain consistent savings
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Review your monthly statements to track your progress and identify opportunities
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply global font style */}
      <style jsx global>{`
        body {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
    </DashboardLayout>
  )
}
