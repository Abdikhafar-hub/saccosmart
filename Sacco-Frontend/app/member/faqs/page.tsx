"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, DollarSign, CreditCard, User } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const faqData = [
  {
    id: "1",
    category: "Contributions",
    question: "How do I make monthly contributions?",
    answer:
      "You can make contributions through M-Pesa, bank transfer, or cash deposit at our office. The minimum monthly contribution is KES 1,000. Contributions are due by the 15th of each month.",
  },
  {
    id: "2",
    category: "Loans",
    question: "How long does loan approval take?",
    answer:
      "Loan applications are typically processed within 3-5 business days. Emergency loans can be approved within 24 hours for qualifying members.",
  },
  {
    id: "3",
    category: "Account",
    question: "How do I update my contact information?",
    answer:
      "You can update your contact information by visiting the Settings page in your dashboard or by contacting our support team.",
  },
  {
    id: "4",
    category: "General",
    question: "What are the SACCO operating hours?",
    answer:
      "Our office is open Monday to Friday from 8:00 AM to 5:00 PM, and Saturday from 9:00 AM to 1:00 PM. We are closed on Sundays and public holidays.",
  },
]

export default function MemberFAQsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const categories = ["All", "Contributions", "Loans", "Account", "General"]

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Contributions":
        return <DollarSign className="h-4 w-4" />
      case "Loans":
        return <CreditCard className="h-4 w-4" />
      case "Account":
        return <User className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("https://saccosmart.onrender.com/api/dashboard/member", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data.user)
      } catch (err) {
        // fallback: do nothing, user stays null
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (loading || !user) return <LoadingSpinner fullScreen />

  return (
    <DashboardLayout role="member" user={user}>
      <div className="space-y-6 px-2 sm:px-4 md:px-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Find answers to common questions about your SACCO account and services.
          </p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search FAQs</CardTitle>
            <CardDescription>Search through our knowledge base or filter by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer text-xs sm:text-sm px-2 py-1"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Questions & Answers</CardTitle>
            <CardDescription className="text-xs sm:text-base">{filteredFAQs.length} question(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(faq.category)}
                      <span>{faq.question}</span>
                      <Badge variant="outline" className="ml-auto text-xs sm:text-sm">
                        {faq.category}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-xs sm:text-base">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
