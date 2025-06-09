"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Banknote,
  Plus,
  Eye,
  Download,
  Calculator,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Loan {
  _id: string
  amount: number
  status: string
  date?: string
  term?: string
  reason?: string
  balance?: number
  disbursedAmount?: number
  interestRate?: number
  monthlyPayment?: number
  nextDueDate?: string
  completedDate?: string
  rejectedDate?: string
  rejectionReason?: string
  purpose?: string
}

interface Payment {
  date?: string
  loanId: string
  amount: number
  type: string
  status: string
  method: string
}

interface LoanLimitData {
  maximumLimit: number
  available: number
  used: number
  basedOn?: string
}

interface LoanResponse {
  loans: Loan[]
  loanLimit: LoanLimitData
}

export default function MemberLoans() {
  const [loanData, setLoanData] = useState<LoanResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isApplicationOpen, setIsApplicationOpen] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [loanAmount, setLoanAmount] = useState("")
  const [loanReason, setLoanReason] = useState("")
  const [repaymentTerm, setRepaymentTerm] = useState("")
  const [calculatorAmount, setCalculatorAmount] = useState("")
  const [calculatorTerm, setCalculatorTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([])
  const { toast } = useToast()

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Member",
  }

  // Fetch all loan-related data from backend
  const fetchLoanData = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
      // Fetch loans and loan limit data
      const loansRes = await axios.get("http://localhost:5000/api/loan", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLoanData(loansRes.data)

      // Fetch payment history
      const paymentHistoryRes = await axios.get("http://localhost:5000/api/loan/payments", {
          headers: { Authorization: `Bearer ${token}` }
        })
      setPaymentHistory(paymentHistoryRes.data)
      } catch (err) {
      setError("Failed to load loan data")
      console.error("Failed to fetch loan data", err)
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchLoanData()
  }, [])

  // Handle loan application
  const handleLoanApplication = async () => {
    if (!loanAmount || Number(loanAmount) <= 0 || !loanReason || !repaymentTerm) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      })
      return
    }

    if (Number(loanAmount) > (loanData?.loanLimit.available || 0)) {
      toast({
        title: "Amount Exceeds Limit",
        description: `Maximum available amount is KES ${loanData?.loanLimit.available.toLocaleString()}`,
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "http://localhost:5000/api/loan/request",
        {
          amount: Number(loanAmount),
          reason: loanReason,
          term: repaymentTerm,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted for review",
      })
      setLoanAmount("")
      setLoanReason("")
      setRepaymentTerm("")
      setIsApplicationOpen(false)
      fetchLoanData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to apply for loan",
        variant: "destructive",
      })
      console.error("Loan application failed:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter loans by status
  const activeLoans = loanData?.loans.filter(l => l.status === "approved" || l.status === "active") || []
  const loanApplications = loanData?.loans.filter(l => l.status === "pending") || []
  const loanHistory = loanData?.loans.filter(l => l.status === "completed" || l.status === "rejected") || []

  // Get the most recent pending application
  const latestPendingApplication = loanApplications[0]

  const viewLoanDetails = (loanId: string) => {
    const loan = loanData?.loans.find(l => l._id === loanId)
    if (loan) {
    toast({
      title: "Loan Details",
      description: `Viewing details for loan ${loanId}`,
    })
    }
  }

  const downloadStatement = (loanId: string) => {
    toast({
      title: "Download Started",
      description: `Downloading statement for loan ${loanId}`,
    })
  }

  // Helper function to safely access loan limit data
  const getLoanLimitData = () => {
    if (!loanData?.loanLimit) {
      return {
        maximumLimit: 0,
        available: 0,
        used: 0,
        basedOn: "Default SACCO Policy"
      }
    }
    return loanData.loanLimit
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <DashboardLayout role="member" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loans</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your loan applications and track repayments</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calculator className="h-4 w-4 mr-2" />
                  Loan Calculator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Loan Calculator</DialogTitle>
                  <DialogDescription>Calculate your monthly payments and total interest</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calc-amount">Loan Amount (KES)</Label>
                    <Input
                      id="calc-amount"
                      type="number"
                      placeholder="Enter loan amount"
                      value={calculatorAmount}
                      onChange={(e) => setCalculatorAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calc-term">Repayment Term (months)</Label>
                    <Select onValueChange={setCalculatorTerm} value={calculatorTerm}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="18">18 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {calculatorAmount && calculatorTerm && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold">Calculation Results:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Monthly Payment</p>
                          <p className="font-bold text-blue-600">
                            KES {((Number(calculatorAmount) * 1.12) / Number(calculatorTerm)).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Total Interest</p>
                          <p className="font-bold text-orange-600">
                            KES {(Number(calculatorAmount) * 0.12).toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600 dark:text-gray-400">Total Payment</p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            KES {(Number(calculatorAmount) * 1.12).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCalculatorOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
              <DialogTrigger asChild>
                {(() => {
                  const limitData = getLoanLimitData()
                  return limitData.available > 0 ? (
                <Button className="bg-sacco-blue hover:bg-sacco-blue/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Apply for Loan
                </Button>
                  ) : (
                    <Button className="bg-gray-400 cursor-not-allowed" disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Apply for Loan
                    </Button>
                  )
                })()}
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Apply for a Loan</DialogTitle>
                  <DialogDescription>Fill out the form below to submit your loan application</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Loan Amount (KES)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      max={loanData?.loanLimit.available}
                      disabled={!loanData?.loanLimit.available}
                    />
                    <p className="text-xs text-gray-500">
                      Available limit: KES {loanData?.loanLimit.available.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">Repayment Term</Label>
                    <Select onValueChange={setRepaymentTerm} value={repaymentTerm} disabled={!loanData?.loanLimit.available}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select repayment term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6 months">6 months</SelectItem>
                        <SelectItem value="12 months">12 months</SelectItem>
                        <SelectItem value="18 months">18 months</SelectItem>
                        <SelectItem value="24 months">24 months</SelectItem>
                        <SelectItem value="36 months">36 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Purpose of Loan</Label>
                    <Textarea
                      id="reason"
                      placeholder="Describe the purpose of your loan"
                      value={loanReason}
                      onChange={(e) => setLoanReason(e.target.value)}
                      rows={3}
                      disabled={!loanData?.loanLimit.available}
                    />
                  </div>
                  {(() => {
                    const limitData = getLoanLimitData()
                    return !limitData.available && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <AlertTriangle className="h-4 w-4 inline-block mr-1" /> You have reached your maximum loan limit.
                          Please repay your existing loans to apply for a new one.
                        </p>
                      </div>
                    )
                  })()}
                  {(() => {
                    const limitData = getLoanLimitData()
                    return limitData.available > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> Loan applications are subject to approval based on your contribution
                      history and SACCO policies.
                    </p>
                  </div>
                    )
                  })()}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsApplicationOpen(false)}>
                    Cancel
                  </Button>
                  {(() => {
                    const limitData = getLoanLimitData()
                    return (
                  <Button
                    onClick={handleLoanApplication}
                        disabled={isProcessing || !limitData.available}
                        className={limitData.available ? "bg-sacco-green hover:bg-sacco-green/90" : "bg-gray-400 cursor-not-allowed"}
                  >
                    {isProcessing ? "Submitting..." : "Submit Application"}
                  </Button>
                    )
                  })()}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Loan Status Banner */}
        {latestPendingApplication && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Loan Application Pending</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your application for KES {latestPendingApplication.amount.toLocaleString()} is awaiting admin review.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loan Limit Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Your Loan Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const limitData = getLoanLimitData()
              return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Maximum Limit</p>
                    <p className="text-2xl font-bold text-sacco-blue">
                      KES {limitData.maximumLimit.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{limitData.basedOn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                    <p className="text-2xl font-bold text-green-600">
                      KES {limitData.available.toLocaleString()}
                    </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Currently Used</p>
                    <p className="text-2xl font-bold text-orange-600">
                      KES {limitData.used.toLocaleString()}
                    </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Utilization</p>
                    <Progress
                      value={(limitData.used / limitData.maximumLimit) * 100}
                      className="h-2"
                    />
                <p className="text-xs text-gray-500 mt-1">
                      {Math.round((limitData.used / limitData.maximumLimit) * 100)}% used
                </p>
              </div>
            </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Loan Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active Loans ({activeLoans.length})</TabsTrigger>
            <TabsTrigger value="applications">Applications ({loanApplications.length})</TabsTrigger>
            <TabsTrigger value="history">Loan History ({loanHistory.length})</TabsTrigger>
            <TabsTrigger value="payments">Payment History ({paymentHistory.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeLoans.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Total Outstanding</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        KES {activeLoans.reduce((sum, loan) => sum + (loan.balance || 0), 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Across {activeLoans.length} loans</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Monthly Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        KES {activeLoans.reduce((sum, loan) => sum + (loan.monthlyPayment || 0), 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total monthly obligation</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Next Due Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {activeLoans.some(loan => loan.nextDueDate)
                          ? new Date(
                          Math.min(
                                ...activeLoans.map(loan =>
                              loan.nextDueDate ? new Date(loan.nextDueDate).getTime() : Infinity
                            )
                          )
                            ).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Earliest payment due</p>
                    </CardContent>
                  </Card>
                </div>

                <DataTable
                  data={activeLoans}
                  columns={[
                    {
                      key: "_id",
                      label: "Loan ID",
                      sortable: true,
                    },
                    {
                      key: "amount",
                      label: "Amount",
                      sortable: true,
                      render: (value: number) => `KES ${value.toLocaleString()}`,
                    },
                    {
                      key: "balance",
                      label: "Balance",
                      sortable: true,
                      render: (value: number | undefined) => `KES ${(value || 0).toLocaleString()}`,
                    },
                    {
                      key: "monthlyPayment",
                      label: "Monthly Payment",
                      render: (value: number | undefined) => `KES ${(value || 0).toLocaleString()}`,
                    },
                    {
                      key: "nextDueDate",
                      label: "Next Due",
                      sortable: true,
                      render: (value: string | undefined) =>
                        value ? new Date(value).toLocaleDateString() : "N/A",
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (value: string) => {
                        const statusConfig = {
                          active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
                          approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
                          pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
                          completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
                          rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
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
                          {(row.status === "approved" || row.status === "active" || row.status === "completed") && (
                            <Button size="sm" variant="outline" onClick={() => downloadStatement(row._id)}>
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  title="Active Loans"
                  searchable={true}
                  filterable={false}
                  exportable={true}
                />
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Banknote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Loans</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You don't have any active loans at the moment.
                  </p>
                  {(() => {
                    const limitData = getLoanLimitData()
                    return limitData.available > 0 ? (
                  <Button onClick={() => setIsApplicationOpen(true)} className="bg-sacco-blue hover:bg-sacco-blue/90">
                    Apply for Your First Loan
                  </Button>
                    ) : (
                      <Button className="bg-gray-400 cursor-not-allowed" disabled>
                        No Loan Available
                      </Button>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="applications">
            {loanApplications.length > 0 ? (
              <DataTable
                data={loanApplications}
                columns={[
                  {
                    key: "_id",
                    label: "Application ID",
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
                        {row.status === "pending" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Loan Application</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this loan application? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>No, Keep Application</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => toast({ title: "Cancelled", description: `Application ${row._id} cancelled` })}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Yes, Cancel Application
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ),
                  },
                ]}
                title="Pending Loan Applications"
                searchable={true}
                filterable={false}
                exportable={true}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Pending Applications</h3>
                  <p className="text-gray-600 dark:text-gray-400">You don't have any pending loan applications.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            {loanHistory.length > 0 ? (
            <DataTable
              data={loanHistory}
              columns={[
                  {
                    key: "_id",
                    label: "Loan ID",
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
                    key: "completedDate",
                    label: "Completed/Rejected Date",
                    sortable: true,
                    render: (value: string | undefined, row: any) => {
                      if (row.status === "completed" && row.completedDate)
                        return new Date(row.completedDate).toLocaleDateString()
                      if (row.status === "rejected" && row.rejectedDate)
                        return new Date(row.rejectedDate).toLocaleDateString()
                      return "N/A"
                    },
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (value: string) => {
                      const statusConfig = {
                        completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
                        rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
                      }
                      const config = statusConfig[value as keyof typeof statusConfig] || {
                        color: "bg-gray-100 text-gray-800",
                        icon: Eye,
                      }
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
                    key: "rejectionReason",
                    label: "Reason",
                    render: (value: string | undefined, row: any) =>
                      row.status === "rejected" ? value || "No reason provided" : row.purpose || "N/A",
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
                        {row.status === "completed" && (
                          <Button size="sm" variant="outline" onClick={() => downloadStatement(row._id)}>
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ),
                  },
              ]}
              title="Loan History"
              searchable={true}
                filterable={false}
              exportable={true}
            />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Loan History</h3>
                  <p className="text-gray-600 dark:text-gray-400">You don't have any completed or rejected loans.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments">
            {paymentHistory.length > 0 ? (
            <DataTable
              data={paymentHistory}
                columns={[
                  {
                    key: "date",
                    label: "Date",
                    sortable: true,
                    render: (value: string | undefined) =>
                      value ? new Date(value).toLocaleDateString() : "N/A",
                  },
                  {
                    key: "loanId",
                    label: "Loan ID",
                  },
                  {
                    key: "amount",
                    label: "Amount",
                    sortable: true,
                    render: (value: number) => `KES ${value.toLocaleString()}`,
                  },
                  {
                    key: "type",
                    label: "Type",
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (value: string) => {
                      const colors = {
                        Success: "bg-green-100 text-green-800",
                        Pending: "bg-yellow-100 text-yellow-800",
                        Failed: "bg-red-100 text-red-800",
                      }
                      return (
                        <Badge
                          className={colors[value as keyof typeof colors] || "bg-gray-100 text-gray-800"}
                          variant="secondary"
                        >
                          {value}
                        </Badge>
                      )
                    },
                  },
                  {
                    key: "method",
                    label: "Method",
                  },
                ]}
              title="Payment History"
              searchable={true}
              filterable={true}
              exportable={true}
            />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Payment History</h3>
                  <p className="text-gray-600 dark:text-gray-400">You have no recorded loan payments yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
