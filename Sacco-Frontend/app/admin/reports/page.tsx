"use client"

import { useState, useEffect } from "react"
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
import { generatePDFReport } from "@/utils/reportGenerator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Mock data for reports
const recentReports: { id: string; name: string; type: string; date: string; status: string; format: string; }[] = [];
const scheduledReports: { id: string; name: string; frequency: string; nextRun: string; recipients: string; format: string; }[] = [];
const reportTemplates: { id: string; name: string; category: string; lastUsed: string; format: string; }[] = [];

// Mock data for charts
const monthlyReportGeneration: { name: string; value: number; }[] = [];
const reportTypeDistribution: { name: string; value: number; }[] = [];
const reportFormatDistribution: { name: string; value: number; }[] = [];

export default function AdminReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState("all")
  const [dateRange, setDateRange] = useState("last30")
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState<{ id: string; name: string; type: string; date: string; status: string; format: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    monthlyReports: 0,
    scheduledReports: 0,
    downloads: 0
  });

  // Mock user for layout
  const user = {
    name: "Admin User",
    email: "admin@saccomart.com",
    role: "Administrator",
    avatar: "/placeholder.svg?height=32&width=32",
  }

  // Fetch reports and stats on component mount
  useEffect(() => {
    const fetchReportsAndStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [reportsRes, statsRes] = await Promise.all([
          fetch("http://localhost:5000/api/reports", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/reports/stats", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!reportsRes.ok || !statsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const reports = await reportsRes.json();
        const statsData = await statsRes.json();

        setRecentReports(reports.map((report: any) => ({
          id: report._id,
          name: report.name,
          type: report.type,
          date: new Date(report.createdAt).toISOString().split('T')[0],
          status: report.status,
          format: report.format
        })));

        setStats(statsData);
      } catch (err) {
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsAndStats();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setLoading(true);
    setError(null);

    try {
      // Generate the PDF report
      const pdfBlob = await generatePDFReport();
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', pdfBlob, 'report.pdf');
      formData.append('name', 'Generated Report');
      formData.append('type', selectedReportType);
      formData.append('format', 'PDF');

      // Save the report to the backend
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/reports", {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to save report");
      }

      const savedReport = await response.json();
      
      // Add the new report to the list
      setRecentReports([{
        id: savedReport._id,
        name: savedReport.name,
        type: savedReport.type,
        date: new Date(savedReport.createdAt).toISOString().split('T')[0],
        status: savedReport.status,
        format: savedReport.format
      }, ...recentReports]);

      // Update stats
      setStats(prev => ({
        ...prev,
        totalReports: prev.totalReports + 1,
        monthlyReports: prev.monthlyReports + 1
      }));

      setIsGenerating(false);
      setShowGenerateDialog(false);
    } catch (e) {
      setIsGenerating(false);
      setShowGenerateDialog(false);
      setError("An error occurred while generating the report.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'report.pdf';

      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update download count in stats
      setStats(prev => ({
        ...prev,
        downloads: prev.downloads + 1
      }));
    } catch (error) {
      setError("Failed to download report");
    }
  };

  const handlePrint = async (reportId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to load report for printing");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create an iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        try {
          iframe.contentWindow?.print();
        } catch (error) {
          console.error('Print failed:', error);
        }
        // Clean up
        setTimeout(() => {
          document.body.removeChild(iframe);
          window.URL.revokeObjectURL(url);
        }, 1000);
      };
      
      iframe.src = url;
    } catch (error) {
      setError("Failed to print report");
    }
  };

  const handleShare = async (reportId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to get report details");
      }

      const report = await response.json();
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: report.name,
          text: `Check out this ${report.type} report from SaccoSmart`,
          url: window.location.href
        });
      } else {
        // Fallback: Copy link to clipboard
        const shareUrl = `${window.location.origin}/admin/reports/${reportId}`;
        await navigator.clipboard.writeText(shareUrl);
        alert('Report link copied to clipboard!');
      }
    } catch (error) {
      setError("Failed to share report");
    }
  };

  const handleEmail = async (reportId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/email`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients: prompt('Enter email addresses (comma-separated):')
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send report via email");
      }

      alert('Report sent successfully!');
    } catch (error) {
      setError("Failed to send report via email");
    }
  };

  if (loading) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500">{error}</div>

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
            value={stats.totalReports.toString()}
            description="This month"
            icon={FileText}
            trend={{ value: stats.monthlyReports, isPositive: true }}
          />
          <StatsCard
            title="Scheduled Reports"
            value={stats.scheduledReports.toString()}
            description="Active schedules"
            icon={Calendar}
            trend={{ value: 0, isPositive: true }}
          />
          <StatsCard 
            title="Report Templates" 
            value="0" 
            description="Available templates" 
            icon={FileBarChart} 
          />
          <StatsCard
            title="Downloads"
            value={stats.downloads.toString()}
            description="This month"
            icon={Download}
            trend={{ value: 0, isPositive: true }}
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
                    <Button type="submit" onClick={handleGenerateReport}>
                      {isGenerating ? "Generating..." : "Generate Report"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                  render: (_, row) => (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(row.id)}
                      >
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
                          <DropdownMenuItem onClick={() => handlePrint(row.id)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEmail(row.id)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(row.id)}>
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