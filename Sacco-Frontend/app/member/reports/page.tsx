"use client"

import { useState, useEffect } from "react"
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import axios from "axios"

// Type definitions
interface Loan {
  _id: string;
  amount: number;
  date: string;
  status: string;
  balance?: number;
  term?: number;
  reason?: string;
  paymentHistory?: {
    date: string;
    amount: number;
    status: string;
  }[];
}

interface Contribution {
  _id: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  paymentMethod?: string;
}

interface Transaction {
  _id: string;
  type: 'contribution' | 'loan_payment' | 'loan_disbursement';
  amount: number;
  date: string;
  status: string;
  description: string;
}

interface LoanResponse {
  loans: Loan[];
  loanLimit: {
    maximumLimit: number;
    available: number;
    used: number;
    basedOn: string;
  };
  summary: {
    totalBorrowed: number;
    totalRepaid: number;
    activeLoans: number;
    defaultedLoans: number;
  };
}

interface ContributionResponse {
  contributions: Contribution[];
  summary: {
    totalContributed: number;
    monthlyAverage: number;
    lastContribution: string;
    contributionStreak: number;
  };
}

interface TransactionResponse {
  transactions: Transaction[];
  summary: {
    totalTransactions: number;
    monthlyTransactions: number;
    lastTransaction: string;
  };
}

// Function to fetch loan data
const fetchLoanData = async (): Promise<LoanResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get("http://localhost:5000/api/loan", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    // Ensure we have an array of loans
    const loans = Array.isArray(response.data) ? response.data : response.data.loans || [];
    
    // Calculate summary data from loans array
    const totalBorrowed = loans.reduce((sum: number, loan: Loan) => sum + loan.amount, 0);
    const totalRepaid = loans.reduce((sum: number, loan: Loan) => {
      if (loan.paymentHistory) {
        return sum + loan.paymentHistory.reduce((paymentSum: number, payment) => 
          paymentSum + (payment.status === 'completed' ? payment.amount : 0), 0);
      }
      return sum;
    }, 0);
    const activeLoans = loans.filter((loan: Loan) => loan.status === 'active').length;
    const defaultedLoans = loans.filter((loan: Loan) => loan.status === 'defaulted').length;

    // Calculate loan limit based on contributions (this should come from backend)
    const loanLimit = {
      maximumLimit: 1000000, // This should come from backend
      available: 1000000 - totalBorrowed,
      used: totalBorrowed,
      basedOn: "Contributions"
    };

    return {
      loans,
      loanLimit,
      summary: {
        totalBorrowed,
        totalRepaid,
        activeLoans,
        defaultedLoans
      }
    };
  } catch (error) {
    console.error('Error fetching loan data:', error);
    throw error;
  }
}

// Function to fetch contribution data
const fetchContributionData = async (): Promise<ContributionResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get("http://localhost:5000/api/contribution", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    // Calculate summary data from contributions array
    const contributions = response.data;
    const totalContributed = contributions.reduce((sum: number, c: Contribution) => sum + c.amount, 0);
    const monthlyAverage = totalContributed / (contributions.length || 1);
    const lastContribution = contributions[0]?.date || new Date().toISOString();
    
    // Calculate contribution streak
    let streak = 0;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentYear - Math.floor((currentMonth - i) / 12);
      const hasContribution = contributions.some((c: Contribution) => {
        const date = new Date(c.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
      if (hasContribution) {
        streak++;
      } else {
        break;
      }
    }

    return {
      contributions,
      summary: {
        totalContributed,
        monthlyAverage,
        lastContribution,
        contributionStreak: streak
      }
    };
  } catch (error) {
    console.error('Error fetching contribution data:', error);
    throw error;
  }
}

// Function to fetch transaction data
const fetchTransactionData = async (): Promise<TransactionResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get("http://localhost:5000/api/reports/stats", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return {
      transactions: [], // This will be populated from the reports stats
      summary: {
        totalTransactions: response.data.totalReports,
        monthlyTransactions: response.data.monthlyReports,
        lastTransaction: new Date().toISOString() // This will be updated when we have the actual data
      }
    };
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    throw error;
  }
}

export default function MemberReports() {
  const [reportType, setReportType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const { toast } = useToast()
  const [loanData, setLoanData] = useState<LoanResponse | null>(null)
  const [contributionData, setContributionData] = useState<ContributionResponse | null>(null)
  const [transactionData, setTransactionData] = useState<TransactionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:5000/api/dashboard/member", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data.user)
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError("Failed to load user data");
      }
    }
    fetchUser()
  }, [])

  // Fetch all report data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      setError("")
      try {
        const [loanRes, contributionRes, transactionRes] = await Promise.all([
          fetchLoanData(),
          fetchContributionData(),
          fetchTransactionData()
        ]);

        setLoanData(loanRes);
        setContributionData(contributionRes);
        setTransactionData(transactionRes);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError("Failed to load report data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load report data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [])

  if (loading || !user) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500 p-4">{error}</div>

  // Transform data for charts
  const getChartData = (type: 'loan' | 'contribution' | 'transaction') => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 5);

    let data: { name: string; value: number }[] = [];

    switch (type) {
      case 'loan':
        if (loanData?.loans) {
          data = Array.from({ length: 6 }, (_, i) => {
            const monthIdx = (currentDate.getMonth() - 5 + i + 12) % 12;
            const value = loanData.loans
              .filter(loan => new Date(loan.date).getMonth() === monthIdx)
              .reduce((sum, loan) => sum + loan.amount, 0);
            return { name: months[monthIdx], value };
          });
        }
        break;
      case 'contribution':
        if (contributionData?.contributions) {
          data = Array.from({ length: 6 }, (_, i) => {
            const monthIdx = (currentDate.getMonth() - 5 + i + 12) % 12;
            const value = contributionData.contributions
              .filter(cont => new Date(cont.date).getMonth() === monthIdx)
              .reduce((sum, cont) => sum + cont.amount, 0);
            return { name: months[monthIdx], value };
          });
        }
        break;
      case 'transaction':
        if (transactionData?.transactions) {
          data = Array.from({ length: 6 }, (_, i) => {
            const monthIdx = (currentDate.getMonth() - 5 + i + 12) % 12;
            const value = transactionData.transactions
              .filter(trans => new Date(trans.date).getMonth() === monthIdx)
              .reduce((sum, trans) => sum + trans.amount, 0);
            return { name: months[monthIdx], value };
          });
        }
        break;
    }

    return data;
  };

  const handleGenerateReport = async () => {
    if (!reportType || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        "http://localhost:5000/api/reports",
        {
          name: `${reportType} Report`,
          type: reportType,
          format: 'pdf',
          startDate,
          endDate,
          parameters: {
            startDate,
            endDate
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          responseType: 'blob' // Important for handling PDF download
        }
      );

      setIsGenerateOpen(false);
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully",
      });

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerateReport} disabled={loading}>
                  {loading ? "Generating..." : "Generate Report"}
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
              {/* quickReports.map((report, index) => (
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
              )) */}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Summary Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contribution Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">KES {contributionData?.summary.totalContributed.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Contributions</p>
                    <p className="text-sm text-gray-500">Monthly Average: KES {contributionData?.summary.monthlyAverage.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Loan Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">KES {loanData?.summary.totalBorrowed.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Borrowed</p>
                    <p className="text-sm text-gray-500">Active Loans: {loanData?.summary.activeLoans}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{transactionData?.summary.totalTransactions}</p>
                    <p className="text-sm text-gray-500">Total Transactions</p>
                    <p className="text-sm text-gray-500">This Month: {transactionData?.summary.monthlyTransactions}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contribution Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartCard
                    title="Monthly Contributions"
                    type="bar"
                    data={getChartData('contribution')}
                    dataKey="value"
                    xAxisKey="name"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loan Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartCard
                    title="Monthly Loans"
                    type="bar"
                    data={getChartData('loan')}
                    dataKey="value"
                    xAxisKey="name"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contribution History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contributionData?.contributions.map((contribution) => (
                    <div key={contribution._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">KES {contribution.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{new Date(contribution.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={contribution.status === 'completed' ? 'default' : 'destructive'}>
                        {contribution.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Loan History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loanData?.loans.map((loan) => (
                    <div key={loan._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">KES {loan.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{new Date(loan.date).toLocaleDateString()}</p>
                        {loan.balance && (
                          <p className="text-sm text-gray-500">Balance: KES {loan.balance.toLocaleString()}</p>
                        )}
                      </div>
                      <Badge variant={loan.status === 'active' ? 'default' : 'destructive'}>
                        {loan.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactionData?.transactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">KES {transaction.amount.toLocaleString()}</p>
                      </div>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'destructive'}>
                        {transaction.status}
                      </Badge>
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
