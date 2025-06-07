"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TreasurerDashboard() {
  const { toast } = useToast()

  const user = {
    name: "Treasurer User",
    email: "treasurer@saccosmart.com",
    role: "Treasurer",
  }

  // Mock data for pending verifications
  const pendingContributions = [
    {
      id: "TXN001",
      member: "John Doe",
      amount: 5000,
      mpesaCode: "QA12345678",
      time: "2 hours ago",
      phone: "+254712345678",
    },
    {
      id: "TXN002",
      member: "Jane Smith",
      amount: 3000,
      mpesaCode: "QB87654321",
      time: "4 hours ago",
      phone: "+254723456789",
    },
    {
      id: "TXN003",
      member: "Mike Johnson",
      amount: 7000,
      mpesaCode: "QC11223344",
      time: "6 hours ago",
      phone: "+254734567890",
    },
  ]

  const pendingLoans = [
    {
      id: "LOAN001",
      member: "Sarah Wilson",
      amount: 50000,
      reason: "Business expansion",
      term: "12 months",
      requestDate: "2024-01-15",
      status: "Pending",
    },
    {
      id: "LOAN002",
      member: "David Brown",
      amount: 30000,
      reason: "Emergency medical",
      term: "6 months",
      requestDate: "2024-01-14",
      status: "Pending",
    },
    {
      id: "LOAN003",
      member: "Lisa Davis",
      amount: 75000,
      reason: "Home improvement",
      term: "18 months",
      requestDate: "2024-01-13",
      status: "Pending",
    },
  ]

  const contributionColumns = [
    {
      key: "member",
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
      key: "mpesaCode",
      label: "M-Pesa Code",
    },
    {
      key: "time",
      label: "Time",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => handleVerifyContribution(row.id, "confirm")}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirm
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleVerifyContribution(row.id, "reject")}>
            Reject
          </Button>
          <Button size="sm" variant="outline" onClick={() => viewMemberAccount(row.member)}>
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ]

  const loanColumns = [
    {
      key: "member",
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
      key: "reason",
      label: "Reason",
    },
    {
      key: "term",
      label: "Term",
    },
    {
      key: "requestDate",
      label: "Request Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => handleLoanAction(row.id, "approve")}
            className="bg-green-600 hover:bg-green-700"
          >
            Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleLoanAction(row.id, "reject")}>
            Reject
          </Button>
        </div>
      ),
    },
  ]

  const handleVerifyContribution = (id: string, action: "confirm" | "reject") => {
    toast({
      title: action === "confirm" ? "Contribution Confirmed" : "Contribution Rejected",
      description: `Transaction ${id} has been ${action}ed`,
      variant: action === "confirm" ? "default" : "destructive",
    })
  }

  const handleLoanAction = (id: string, action: "approve" | "reject") => {
    toast({
      title: action === "approve" ? "Loan Approved" : "Loan Rejected",
      description: `Loan application ${id} has been ${action}d`,
      variant: action === "approve" ? "default" : "destructive",
    })
  }

  const viewMemberAccount = (member: string) => {
    toast({
      title: "Member Account",
      description: `Viewing account details for ${member}`,
    })
  }

  return (
    <DashboardLayout role="treasurer" user={user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Treasurer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage contributions and loan approvals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Pending Contributions" value="3" description="Awaiting verification" icon={Clock} />
          <StatsCard title="Pending Loans" value="3" description="Awaiting approval" icon={AlertCircle} />
          <StatsCard title="Verified Today" value="12" description="Contributions confirmed" icon={CheckCircle} />
          <StatsCard title="Active Members" value="156" description="Total SACCO members" icon={Users} />
        </div>

        {/* Pending Contributions */}
        <DataTable
          data={pendingContributions}
          columns={contributionColumns}
          title="Pending Contribution Verifications"
          searchable={true}
          filterable={false}
          exportable={false}
        />

        {/* Pending Loan Applications */}
        <DataTable
          data={pendingLoans}
          columns={loanColumns}
          title="Pending Loan Applications"
          searchable={true}
          filterable={true}
          exportable={true}
        />
      </div>
    </DashboardLayout>
  )
}
