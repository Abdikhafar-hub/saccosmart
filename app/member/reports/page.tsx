"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ChartCard } from "@/components/ui/chart-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, BarChart3, TrendingUp, Banknote, Eye, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function MemberReports() {
  const [reportType, setReportType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const { toast } = useToast()

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Member",
  }

  // Mock data for charts
  const contributionTrends = [
    { name: "Jul", value: 5000 },
    { name: "Aug", value: 7000 },
    { name: "Sep", value: 6000 },
    { name: "Oct", value: 8000 },
    { name: "Nov", value: 9000 },
    { name: "Dec", value: 7500 },
  ]

  const loanRepaymentTrends = [
    { name: "Jul", value: 4500 },
    { name: "Aug", value: 4500 },
    { name: "Sep", value: 4500 },
    { name: "Oct", value: 9000 },
    { name: "Nov", value: 9000 },
    { name: "Dec", value: 9000 },
  ]

  const accountBreakdown = [
    { name: "Savings", value: 45000 },
    { name: "Shares", value: 15000 },
    { name: "Dividends", value: 8000 },
    { name: "Interest", value: 3000 },
  ]

  const loanStatusBreakdown = [
    { name: "Active Loans", value: 2 },
    { name: "Completed", value: 1 },
    { name: "Pending", value: 1 },
  ]

  // Mock report history
  const reportHistory = [
    {
      id: "RPT001",
      type: "Financial Statement",
      period: "Jan 2024 - Dec 2024",
      generatedDate: "2024-01-15",
      status: "Ready",
      size: "2.3 MB",
    },
    {
      id: "RPT002",
      type: "Contribution Summary",
      period: "Jul 2023 - Dec 2023",
      generatedDate: "2024-01-01",
      status: "Ready",
      size: "1.8 MB",
    },
    {
      id: "RPT003",
      type: "Loan Statement",
      period: "Jan 2023 - Dec 2023",
      generatedDate: "2023-12-31",
      status: "Ready",
      size: "1.2 MB",
    },
    {
      id: "RPT004",
      type: "Tax Certificate",
      period: "2023",
      generatedDate: "2023-12-15",
      status: "Ready",
      size: "0.5 MB",
    },
  ]

  const quickReports = [
    {
      title: "Monthly Statement",
      description: "Current month contributions and transactions",
      icon: FileText,
      type: "monthly",
    },
    {
      title: "Annual Summary",
      description: "Complete year financial summary",
      icon: BarChart3,
      type: "annual",
    },
    {
      title: "Loan Statement",
      description: "All loan details and payment history",
      icon: Banknote,
      type: "loans",
    },
    {
      title: "Tax Certificate",
      description: "Certificate for tax purposes",
      icon: FileText,
      type: "tax",
    },
  ]

  const handleGenerateReport = () => {
    if (!reportType || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simulate report generation
    setTimeout(() => {
      setIsGenerateOpen(false)
      toast({
        title: "Report Generated",
        description: "Your report has been generated and will be available for download shortly",
      })
    }, 2000)
  }

  const handleQuickReport = (type: string) => {
    toast({
      title: "Generating Report",
      description: `Generating ${type} report...`,
    })

    // Simulate quick report generation
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: "Your report is ready for download",
      })
    }, 3000)
  }

  const downloadReport = (reportId: string) => {
    toast({
      title: "Download Started",
      description: `Downloading report ${reportId}`,
    })
  }

  const emailReport = (reportId: string) => {
    toast({
      title: "Email Sent",
      description: `Report ${reportId} has been sent to your email`,
    })
  }

  const viewReport = (reportId: string) => {
    toast({
      title: "Opening Report",
      description: `Opening report ${reportId} in viewer`,
    })
  }

  return (
    <DashboardLayout role="member" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">View your financial reports and download statements</p>
          </div>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sacco-blue hover:bg-sacco-blue/90">
                <FileText className="h-4 w-4 mr-2" />
                Generate Custom Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Custom Report</DialogTitle>
                <DialogDescription>Create a custom report for a specific date range and type</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial Statement</SelectItem>
                      <SelectItem value="contributions">Contribution Summary</SelectItem>
                      <SelectItem value="loans">Loan Statement</SelectItem>
                      <SelectItem value="transactions">Transaction History</SelectItem>
                      <SelectItem value="tax">Tax Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Reports may take a few minutes to generate depending on the date range
                    selected.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateReport} className="bg-sacco-green hover:bg-sacco-green/90">
                  Generate Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickReports.map((report, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleQuickReport(report.type)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-sacco-blue/10 rounded-lg">
                      <report.icon className="h-5 w-5 text-sacco-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center space-x-4">
              <Label>Period:</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                  <SelectItem value="2years">Last 2 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Account Balance Breakdown"
                description="Distribution of your SACCO account"
                type="pie"
                data={accountBreakdown}
                dataKey="value"
                xAxisKey="name"
              />
              <ChartCard
                title="Monthly Contributions"
                description="Your contribution trends over time"
                type="bar"
                data={contributionTrends}
                dataKey="value"
                xAxisKey="name"
              />
            </div>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Contribution Trends"
                description="Monthly contribution patterns"
                type="line"
                data={contributionTrends}
                dataKey="value"
                xAxisKey="name"
              />
              <Card>
                <CardHeader>
                  <CardTitle>Contribution Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Contributions</span>
                    <span className="font-bold text-sacco-blue">KES 45,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Monthly</span>
                    <span className="font-bold">KES 7,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Highest Month</span>
                    <span className="font-bold text-green-600">KES 9,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Growth Rate</span>
                    <Badge className="bg-green-100 text-green-800" variant="secondary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +15%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loans" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Loan Repayment History"
                description="Monthly loan payments over time"
                type="bar"
                data={loanRepaymentTrends}
                dataKey="value"
                xAxisKey="name"
              />
              <ChartCard
                title="Loan Status Distribution"
                description="Current status of all your loans"
                type="pie"
                data={loanStatusBreakdown}
                dataKey="value"
                xAxisKey="name"
              />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Report History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportHistory.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{report.type}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{report.period}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Generated: {new Date(report.generatedDate).toLocaleDateString()}</span>
                            <span>Size: {report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800" variant="secondary">
                          {report.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => viewReport(report.id)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => emailReport(report.id)}>
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                        <Button size="sm" onClick={() => downloadReport(report.id)}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
