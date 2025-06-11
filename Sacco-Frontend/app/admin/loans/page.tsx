"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Clock, CheckCircle, XCircle, Banknote } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

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

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()

  const fetchLoansData = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const loansRes = await axios.get("https://saccosmart.onrender.com/api/admin/loans", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLoans(loansRes.data.loans || [])
    } catch (err) {
      setError("Failed to load loans data")
      console.error("Failed to fetch loans data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoansData()
  }, [])

  useEffect(() => {
    console.log("Loans data:", loans);
  }, [loans]);

  const handleApproveLoan = async (loanId: string) => {
    const loan = loans.find(l => l._id === loanId)
    if (!loan) {
      toast({
        title: "Error",
        description: "Loan not found",
        variant: "destructive",
      })
      return
    }
    if (loan.status !== "pending") {
      toast({
        title: "Error",
        description: "Only pending loans can be approved",
        variant: "destructive",
      })
      return
    }
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `https://saccosmart.onrender.com/api/loan/admin/${loanId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast({
        title: "Loan Approved",
        description: "The loan has been approved successfully",
      })
      fetchLoansData()
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to approve loan",
        variant: "destructive",
      })
      console.error("Failed to approve loan:", err.response?.data || err)
    }
  }

  const handleRejectLoan = async () => {
    if (!selectedLoan || !rejectionReason) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }
    if (selectedLoan.status !== "pending") {
      toast({
        title: "Error",
        description: "Only pending loans can be rejected",
        variant: "destructive",
      })
      return
    }
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `https://saccosmart.onrender.com/api/loan/admin/${selectedLoan._id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast({
        title: "Loan Rejected",
        description: "The loan has been rejected successfully",
      })
      setIsRejectDialogOpen(false)
      setSelectedLoan(null)
      setRejectionReason("")
      fetchLoansData()
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to reject loan",
        variant: "destructive",
      })
      console.error("Failed to reject loan:", err.response?.data || err)
    }
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <TooltipProvider>
      <DashboardLayout role="admin" user={{ name: "Admin", email: "", role: "Admin" }}>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loan Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage loan approvals and rejections</p>

          {/* Loan Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Outstanding Loans"
              value={loans.reduce((total, loan) => total + (loan.balance || 0), 0).toLocaleString()}
              description="Total amount of outstanding loans"
              icon={Banknote}
              className="bg-blue-100 text-blue-800"
            />
            <StatsCard
              title="Pending Loans"
              value={loans.filter(l => l.status === "pending").length.toLocaleString()}
              description="Loans awaiting approval"
              icon={Clock}
              className="bg-yellow-100 text-yellow-800"
            />
            <StatsCard
              title="Approved Loans"
              value={loans.filter(l => l.status === "approved").length.toLocaleString()}
              description="Loans that have been approved"
              icon={CheckCircle}
              className="bg-green-100 text-green-800"
            />
            <StatsCard
              title="Rejected Loans"
              value={loans.filter(l => l.status === "rejected").length.toLocaleString()}
              description="Loans that have been rejected"
              icon={XCircle}
              className="bg-red-100 text-red-800"
            />
          </div>

          {/* Loan Table */}
          <DataTable
            data={loans}
            columns={[
              {
                key: "userName",
                label: "User Name",
                render: (userName: string) => (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer text-blue-600 hover:underline">{userName}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>More info about {userName}</span>
                    </TooltipContent>
                  </Tooltip>
                ),
              },
              { key: "amount", label: "Amount", render: (amount: number) => <span className="font-bold text-lg">{amount.toLocaleString()}</span> },
              {
                key: "status",
                label: "Status",
                render: (status: string) => (
                  <span className={`flex items-center space-x-1 ${
                    status === "approved" ? "text-green-600" :
                    status === "rejected" ? "text-red-600" :
                    "text-yellow-600"
                  }`}>
                    {status === "approved" && <CheckCircle className="h-4 w-4" />}
                    {status === "pending" && <Clock className="h-4 w-4" />}
                    {status === "rejected" && <XCircle className="h-4 w-4" />}
                    <span>{status}</span>
                  </span>
                ),
              },
              { key: "date", label: "Date" },
              {
                key: "actions",
                label: "Actions",
                render: (_: any, loan: Loan) => (
                  <div className="flex space-x-2 items-center">
                    {loan ? (
                      <>
                        <Badge className={
                          loan.status === "approved" ? "bg-green-100 text-green-800" :
                          loan.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {loan.status}
                        </Badge>
                        <Button onClick={() => handleApproveLoan(loan._id)} disabled={loan.status !== "pending"} className="bg-blue-500 text-white hover:bg-blue-600">
                          Approve
                        </Button>
                        <Button onClick={() => {
                          setSelectedLoan(loan);
                          setIsRejectDialogOpen(true);
                        }} disabled={loan.status !== "pending"} className="bg-red-500 text-white hover:bg-red-600">
                          Reject
                        </Button>
                      </>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />

          {/* Reject Loan Dialog */}
          {isRejectDialogOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-4">Reject Loan</h2>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setIsRejectDialogOpen(false)} className="mr-2">
                    Cancel
                  </Button>
                  <Button onClick={handleRejectLoan} variant="destructive">
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </TooltipProvider>
  )
} 