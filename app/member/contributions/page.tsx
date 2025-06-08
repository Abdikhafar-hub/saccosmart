"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreditCard, Smartphone, CheckCircle, Clock, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { Select } from "@/components/ui/select"


interface Contribution {
  _id?: string
  amount: number
  date: string
  status?: string
  mpesaCode?: string
  method?: string
}

export default function MemberContributions() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const [method, setMethod] = useState("M-Pesa")
  const [reference, setReference] = useState("")
  const [paymentDate, setPaymentDate] = useState("")
  const [phone, setPhone] = useState("")
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false)
  const [isMpesaProcessing, setIsMpesaProcessing] = useState(false)
  const [mpesaError, setMpesaError] = useState("")
  const paystackScriptLoaded = useRef(false)

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Member",
  }

  const fetchContributions = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:5000/api/contribution", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setContributions(res.data)
    } catch (err) {
      setError("Failed to load contributions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContributions()
  }, [])

  // Load Paystack script only once
  useEffect(() => {
    if (!paystackScriptLoaded.current) {
      const script = document.createElement("script")
      script.src = "https://js.paystack.co/v1/inline.js"
      script.async = true
      document.body.appendChild(script)
      paystackScriptLoaded.current = true
    }
  }, [])
  

  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) => `KES ${value.toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const statusConfig = {
          Confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
          Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
          Failed: { color: "bg-red-100 text-red-800", icon: XCircle },
        }
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig["Pending"]
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
      key: "mpesaCode",
      label: "M-Pesa Code",
    },
    {
      key: "method",
      label: "Method",
    },
  ]

  const handleContribution = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive",
      })
      return
    }
    setIsProcessing(true)
    try {
      const token = localStorage.getItem("token")
      const payload: any = {
        amount: Number(amount),
        method,
      }
      if (reference) payload.reference = reference
      if (paymentDate) payload.date = paymentDate

      await axios.post(
        "http://localhost:5000/api/contribution",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast({
        title: "Payment Successful",
        description: `Your contribution of KES ${amount} has been received`,
      })
      setAmount("")
      setReference("")
      setPaymentDate("")
      setMethod("M-Pesa")
      setIsDialogOpen(false)
      fetchContributions()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to make contribution",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setLoading(false)
    }
  }

  const handleCardPayment = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive",
      })
      return
    }
  
    const token = localStorage.getItem("token")
  
    try {
      // Step 1: Call backend to initiate Paystack transaction
      const res = await axios.post(
        "http://localhost:5000/api/card/initiate",
        { amount: Number(amount) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
  
      const { email, reference } = res.data
  
      // Step 2: Open Paystack modal using secure values from backend
      const handler = (window as any).PaystackPop?.setup({
        key: "pk_test_d937d9bb95efebe8c207d39f453ca9bc5b8f8d29",
        email,
        amount: Number(amount) * 100,
        currency: "KES",
        reference,
        metadata: {
          memberId: email,
        },
        callback: function (response: any) {
          console.log("Paystack response:", response.reference)
          ;(async () => {
            try {
              await axios.get(
                `http://localhost:5000/api/card/verify/${response.reference}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
              toast({
                title: "Payment Successful",
                description: `Your contribution of KES ${amount} has been received`,
              })
              setAmount("")
              setReference("")
              setPaymentDate("")
              setMethod("M-Pesa")
              setIsDialogOpen(false)
              fetchContributions()
            } catch (err) {
              toast({
                title: "Verification Error",
                description: "Failed to verify card payment",
                variant: "destructive",
              })
            } finally {
              setIsProcessing(false)
            }
          })()
        },
        
        onClose: () => {
          setIsProcessing(false)
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the card payment.",
            variant: "destructive",
          })
        },
      })
  
      if (handler) {
        handler.openIframe()
        setIsProcessing(true)
      } else {
        toast({
          title: "Paystack Error",
          description: "Paystack failed to initialize",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Initiation error:", err)
      toast({
        title: "Error",
        description: "Failed to initiate card payment",
        variant: "destructive",
      })
    }
  }
  
  
  
  
  

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  const total = contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
  const thisMonth = contributions
    .filter((c) => new Date(c.date).getMonth() === new Date().getMonth())
    .reduce((sum, c) => sum + (c.amount || 0), 0)
  const avgMonthly =
    contributions.length > 0
      ? Math.round(
          contributions.reduce((sum, c) => sum + (c.amount || 0), 0) /
            Math.max(1, new Set(contributions.map((c) => new Date(c.date).getMonth())).size)
        )
      : 0

  return (
    <DashboardLayout role="member" user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contributions</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your SACCO contributions and view history</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sacco-blue hover:bg-sacco-blue/90">
                <CreditCard className="h-4 w-4 mr-2" />
                Make Contribution
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Make a Contribution</DialogTitle>
                <DialogDescription>Enter the amount you want to contribute to your SACCO account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <select
                    id="method"
                    className="w-full border rounded px-3 py-2"
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                {(method === "Cash" || method === "Bank Transfer" || method === "Cheque") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference Number (optional)</Label>
                      <Input
                        id="reference"
                        type="text"
                        placeholder="Enter reference number"
                        value={reference}
                        onChange={e => setReference(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">Payment Date (optional)</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={paymentDate}
                        onChange={e => setPaymentDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
                {method === "M-Pesa" && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">M-Pesa Payment</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You will receive an M-Pesa prompt on your registered phone number.
                    </p>
                  </div>
                )}
                {method === "Card" && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Card Payment</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Card payment coming soon. For now, this is a placeholder.
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                {method === "M-Pesa" ? (
                  <>
                    <Button
                      onClick={() => setIsMpesaModalOpen(true)}
                      disabled={isProcessing}
                      className="bg-sacco-green hover:bg-sacco-green/90"
                    >
                      Pay with M-Pesa
                    </Button>
                    <Dialog open={isMpesaModalOpen} onOpenChange={setIsMpesaModalOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <div className="flex flex-col items-center justify-center mb-4">
                            <img 
                              src="https://res.cloudinary.com/ddkkfumkl/image/upload/v1739738617/brw9k4a0cygey6jorfnb.png" 
                              alt="M-Pesa Logo" 
                              className="h-24 w-auto mb-4" 
                            />
                            <DialogTitle>Enter Phone Number</DialogTitle>
                          </div>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            id="mpesa-phone"
                            type="tel"
                            placeholder="e.g. 2547XXXXXXXX"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            disabled={isMpesaProcessing}
                          />
                          {mpesaError && <div className="text-red-500 text-sm">{mpesaError}</div>}
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={async () => {
                              setIsMpesaProcessing(true);
                              setMpesaError("");
                              try {
                                let formattedPhone = phone.replace(/\D/g, '');

                                
                                if (formattedPhone.startsWith("07") && formattedPhone.length === 10) {
                                  formattedPhone = "254" + formattedPhone.substring(1); 
                                } else if (formattedPhone.startsWith("254") && formattedPhone.length === 12) {
                                  // already valid
                                } else {
                                  setMpesaError("Invalid phone number. Use format 07XXXXXXXX or 2547XXXXXXXX");
                                  setIsMpesaProcessing(false);
                                  return;
                                }

                                const token = localStorage.getItem("token");
                                const memberId = user.email;
                                await axios.post(
                                  "http://localhost:5000/api/payments/mpesa-stk",
                                  {
                                    amount: Number(amount),
                                    phone: formattedPhone,
                                    memberId,
                                    method: "M-Pesa"
                                  },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                toast({
                                  title: "Processing payment...",
                                  description: "Check your phone to complete the payment.",
                                });
                                setIsMpesaModalOpen(false);
                                setPhone("");
                              } catch (err: any) {
                                setMpesaError(err.response?.data?.message || "Failed to initiate M-Pesa payment");
                              } finally {
                                setIsMpesaProcessing(false);
                              }
                            }}
                            disabled={isMpesaProcessing || !phone}
                            className="bg-sacco-green hover:bg-sacco-green/90 min-h-[44px]"
                          >
                            {isMpesaProcessing ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                              </div>
                            ) : (
                              "Submit"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : method === "Card" ? (
                  <Button
                    onClick={handleCardPayment}
                    disabled={isProcessing}
                    className="bg-sacco-green hover:bg-sacco-green/90"
                  >
                    {isProcessing ? "Processing..." : "Pay with Card"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleContribution}
                    disabled={isProcessing}
                    className="bg-sacco-green hover:bg-sacco-green/90"
                  >
                    {isProcessing
                      ? "Processing..."
                      : method === "Card"
                      ? "Pay with Card"
                      : "Submit"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sacco-blue">KES {total.toLocaleString()}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lifetime contributions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sacco-green">KES {thisMonth.toLocaleString()}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current month contributions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">KES {avgMonthly.toLocaleString()}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 6 months average</p>
            </CardContent>
          </Card>
        </div>

        <DataTable
          data={contributions}
          columns={columns}
          title="Contribution History"
          searchable={true}
          filterable={true}
          exportable={true}
        />
      </div>
    </DashboardLayout>
  )
}