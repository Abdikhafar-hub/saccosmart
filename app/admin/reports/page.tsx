"use client"

import { useState } from "react"
import {
  FileText,
  Calendar,
  Download,
  Users,
  CreditCard,
  FileBarChart,
  ChevronDown,
  Printer,
  Mail,
  Share2,
  PieChart,
  TrendingUp,
  Landmark,
  ShieldCheck,
} from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ChartCard } from "@/components/ui/chart-card"
import { StatsCard } from "@/components/ui/stats-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data for reports
const recentReports = [
  {
    id: "REP-001",
    name: "Monthly Financial Summary",
    type: "Financial",
    date: "2025-05-25",
    status: "Generated",
    format: "PDF",
  },
  {
    id: "REP-002",
    name: "Loan Portfolio Analysis",
    type: "Loans",
    date: "2025-05-24",
    status: "Generated",
    format: "Excel",
  },
  {
    id: "REP-003",
    name: "Member Contribution Trends",
    type: "Contributions",
    date: "2025-05-23",
    status: "Generated",
    format: "PDF",
  },
  {
    id: "REP-004",
    name: "Defaulted Loans Report",
    type: "Loans",
    date: "2025-05-22",
    status: "Generated",
    format: "Excel",
  },
  {
    id: "REP-005",
    name: "New Member Registrations",
    type: "Members",
    date: "2025-05-21",
    status: "Generated",
    format: "PDF",
  },
  {
    id: "REP-006",
    name: "Quarterly Compliance Report",
    type: "Compliance",
    date: "2025-05-20",
    status: "Generated",
    format: "PDF",
  },
  {
    id: "REP-007",
    name: "Annual Financial Statement",
    type: "Financial",
    date: "2025-05-15",
    status: "Generated",
    format: "PDF",
  },
]

const scheduledReports = [
  {
    id: "SCH-001",
    name: "Monthly Financial Summary",
    frequency: "Monthly",
    nextRun: "2025-06-01",
    recipients: "Board Members",
    format: "PDF",
  },
  {
    id: "SCH-002",
    name: "Loan Portfolio Analysis",
    frequency: "Weekly",
    nextRun: "2025-06-03",
    recipients: "Loan Officers",
    format: "Excel",
  },
  {
    id: "SCH-003",
    name: "Member Contribution Trends",
    frequency: "Monthly",
    nextRun: "2025-06-01",
    recipients: "Finance Team",
    format: "PDF",
  },
  {
    id: "SCH-004",
    name: "Compliance Status Report",
    frequency: "Quarterly",
    nextRun: "2025-07-01",
    recipients: "Compliance Officer",
    format: "PDF",
  },
]

const reportTemplates = [
  {
    id: "TEMP-001",
    name: "Financial Summary",
    category: "Financial",
    lastUsed: "2025-05-25",
    format: "PDF",
  },
  {
    id: "TEMP-002",
    name: "Loan Portfolio Analysis",
    category: "Loans",
    lastUsed: "2025-05-24",
    format: "Excel",
  },
  {
    id: "TEMP-003",
    name: "Member Contribution Report",
    category: "Contributions",
    lastUsed: "2025-05-23",
    format: "PDF",
  },
  {
    id: "TEMP-004",
    name: "Defaulted Loans Summary",
    category: "Loans",
    lastUsed: "2025-05-22",
    format: "Excel",
  },
  {
    id: "TEMP-005",
    name: "New Member Registration",
    category: "Members",
    lastUsed: "2025-05-21",
    format: "PDF",
  },
  {
    id: "TEMP-006",
    name: "Compliance Status",
    category: "Compliance",
    lastUsed: "2025-05-20",
    format: "PDF",
  },
  {
    id: "TEMP-007",
    name: "Annual Financial Statement",
    category: "Financial",
    lastUsed: "2025-05-15",
    format: "PDF",
  },
]

// Mock data for charts
const monthlyReportGeneration = [
  { name: "Jan", value: 45 },
  { name: "Feb", value: 52 },
  { name: "Mar", value: 48 },
  { name: "Apr", value: 61 },
  { name: "May", value: 58 },
]

const reportTypeDistribution = [
  { name: "Financial", value: 35 },
  { name: "Loans", value: 25 },
  { name: "Members", value: 20 },
  { name: "Contributions", value: 15 },
  { name: "Compliance", value: 5 },
]

const reportFormatDistribution = [
  { name: "PDF", value: 65 },
  { name: "Excel", value: 25 },
  { name: "CSV", value: 10 },
]

export default function AdminReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState("all")
  const [dateRange, setDateRange] = useState("last30")
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  // Mock user for layout
  const user = {
    name: "Admin User",
    email: "admin@saccomart.com",
    role: "Administrator",
    avatar: "/placeholder.svg?height=32&width=32",
  }

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
          <p className="text-muted-foreground">
            Generate, schedule, and manage all SACCO reports from a central location.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Reports Generated"
            value="248"
            description="This month"
            icon={FileText}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Scheduled Reports"
            value="16"
            description="Active schedules"
            icon={Calendar}
            trend={{ value: 4, isPositive: true }}
          />
          <StatsCard title="Report Templates" value="24" description="Available templates" icon={FileBarChart} />
          <StatsCard
            title="Downloads"
            value="186"
            description="This month"
            icon={Download}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Generate common reports or create custom reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                <DialogTrigger asChild>
                  <Button className="h-24 flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-6 w-6" />
                    <span>Generate Report</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Generate New Report</DialogTitle>
                    <DialogDescription>Select a report template and customize parameters</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="report-type">Report Type</Label>
                      <Select defaultValue="financial-summary">
                        <SelectTrigger id="report-type">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financial-summary">Financial Summary</SelectItem>
                          <SelectItem value="loan-portfolio">Loan Portfolio Analysis</SelectItem>
                          <SelectItem value="member-contributions">Member Contributions</SelectItem>
                          <SelectItem value="defaulted-loans">Defaulted Loans</SelectItem>
                          <SelectItem value="new-members">New Member Registrations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input id="start-date" type="date" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input id="end-date" type="date" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="report-format">Format</Label>
                      <Select defaultValue="pdf">
                        <SelectTrigger id="report-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="report-recipients">Recipients (Optional)</Label>
                      <Input id="report-recipients" placeholder="Enter email addresses" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" onClick={() => setShowGenerateDialog(false)}>
                      Generate Report
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                <Calendar className="h-6 w-6" />
                <span>Schedule Report</span>
              </Button>

              <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                <FileBarChart className="h-6 w-6" />
                <span>Custom Report</span>
              </Button>

              <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                <Download className="h-6 w-6" />
                <span>Download Center</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="recent" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="recent">Recent Reports</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
              <TabsTrigger value="templates">Report Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7">Last 7 days</SelectItem>
                  <SelectItem value="last30">Last 30 days</SelectItem>
                  <SelectItem value="last90">Last 90 days</SelectItem>
                  <SelectItem value="thisYear">This year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="loans">Loans</SelectItem>
                  <SelectItem value="members">Members</SelectItem>
                  <SelectItem value="contributions">Contributions</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recent Reports Tab */}
          <TabsContent value="recent" className="space-y-4">
            <DataTable
              title="Recent Reports"
              data={recentReports}
              columns={[
                { key: "id", label: "Report ID" },
                { key: "name", label: "Report Name" },
                { key: "type", label: "Type", render: (value) => <Badge variant="outline">{value}</Badge> },
                { key: "date", label: "Generated Date" },
                { key: "format", label: "Format", render: (value) => <Badge variant="secondary">{value}</Badge> },
                {
                  key: "status",
                  label: "Status",
                  render: (value) => <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{value}</Badge>,
                },
                {
                  key: "actions",
                  label: "Actions",
                  render: () => (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ),
                },
              ]}
            />
          </TabsContent>

          {/* Scheduled Reports Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            <DataTable
              title="Scheduled Reports"
              data={scheduledReports}
              columns={[
                { key: "id", label: "Schedule ID" },
                { key: "name", label: "Report Name" },
                { key: "frequency", label: "Frequency", render: (value) => <Badge variant="outline">{value}</Badge> },
                { key: "nextRun", label: "Next Run Date" },
                { key: "recipients", label: "Recipients" },
                { key: "format", label: "Format", render: (value) => <Badge variant="secondary">{value}</Badge> },
                {
                  key: "actions",
                  label: "Actions",
                  render: () => (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        Cancel
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </TabsContent>

          {/* Report Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <DataTable
              title="Report Templates"
              data={reportTemplates}
              columns={[
                { key: "id", label: "Template ID" },
                { key: "name", label: "Template Name" },
                { key: "category", label: "Category", render: (value) => <Badge variant="outline">{value}</Badge> },
                { key: "lastUsed", label: "Last Used" },
                { key: "format", label: "Format", render: (value) => <Badge variant="secondary">{value}</Badge> },
                {
                  key: "actions",
                  label: "Actions",
                  render: () => (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Generate
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ChartCard
                title="Monthly Report Generation"
                description="Number of reports generated per month"
                type="bar"
                data={monthlyReportGeneration}
              />

              <ChartCard
                title="Report Type Distribution"
                description="Breakdown by report category"
                type="pie"
                data={reportTypeDistribution}
              />

              <ChartCard
                title="Report Format Distribution"
                description="Breakdown by output format"
                type="pie"
                data={reportFormatDistribution}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Report Usage Metrics</CardTitle>
                <CardDescription>Key performance indicators for report usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Most Generated Report</span>
                    <span className="text-xl font-bold">Financial Summary</span>
                    <span className="text-xs text-muted-foreground">Generated 42 times</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Most Downloaded Report</span>
                    <span className="text-xl font-bold">Loan Portfolio</span>
                    <span className="text-xs text-muted-foreground">Downloaded 38 times</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Average Generation Time</span>
                    <span className="text-xl font-bold">4.2 seconds</span>
                    <span className="text-xs text-muted-foreground">Across all reports</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">User Engagement</span>
                    <span className="text-xl font-bold">86%</span>
                    <span className="text-xs text-muted-foreground">Reports viewed after generation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Report Categories</CardTitle>
            <CardDescription>Browse reports by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="h-24 justify-start p-4">
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center">
                    <Landmark className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Financial Reports</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Balance sheets, income statements, cash flow</span>
                </div>
              </Button>

              <Button variant="outline" className="h-24 justify-start p-4">
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Loan Reports</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Portfolio analysis, defaults, disbursements</span>
                </div>
              </Button>

              <Button variant="outline" className="h-24 justify-start p-4">
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Member Reports</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Demographics, activity, growth</span>
                </div>
              </Button>

              <Button variant="outline" className="h-24 justify-start p-4">
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Contribution Reports</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Savings trends, deposits, withdrawals</span>
                </div>
              </Button>

              <Button variant="outline" className="h-24 justify-start p-4">
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Compliance Reports</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Regulatory compliance, audits, risk</span>
                </div>
              </Button>

              <Button variant="outline" className="h-24 justify-start p-4">
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Performance Reports</span>
                  </div>
                  <span className="text-xs text-muted-foreground">KPIs, growth metrics, benchmarks</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
