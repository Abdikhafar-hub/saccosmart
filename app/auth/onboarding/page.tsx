"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, CreditCard, BarChart3, Shield, Phone } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()

  const features = [
    {
      icon: CreditCard,
      title: "Easy Contributions",
      description: "Make contributions seamlessly via M-Pesa integration",
    },
    {
      icon: Users,
      title: "Loan Management",
      description: "Apply for loans and track your repayment progress",
    },
    {
      icon: BarChart3,
      title: "Financial Reports",
      description: "Access detailed reports and track your financial growth",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your financial data is protected with bank-level security",
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sacco-blue to-sacco-green p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-full shadow-lg">
              <Building2 className="h-12 w-12 text-sacco-blue" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-sacco-blue">Welcome to SaccoSmart!</CardTitle>
          <CardDescription className="text-lg">Your complete SACCO management solution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-lg">
                <div className="p-2 bg-white rounded-lg">
                  <feature.icon className="h-6 w-6 text-sacco-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-white/80">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Need Help?
            </h3>
            <p className="text-white/80 text-sm mb-2">Our support team is here to help you get started:</p>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Email: support@saccosmart.com</li>
              <li>• Phone: +254 700 123 456</li>
              <li>• WhatsApp: +254 700 123 456</li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Quick Tips:</h3>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Complete your profile to access all features</li>
              <li>• Set up M-Pesa for easy contributions</li>
              <li>• Check your dashboard regularly for updates</li>
              <li>• Download the mobile app for convenience</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => router.push("/member/dashboard")}
            size="lg"
            className="bg-white text-sacco-blue hover:bg-white/90 font-semibold px-8"
          >
            Start Using SaccoSmart
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
