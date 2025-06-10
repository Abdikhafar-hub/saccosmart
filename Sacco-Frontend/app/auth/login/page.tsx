"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Building2, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotMsg, setForgotMsg] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (role: "member" | "admin") => {
    setIsLoading(true)
    setError("")
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      })
      localStorage.setItem("token", res.data.token)
      toast({
        title: "Login Successful",
        description: `Welcome back! Logging in as ${res.data.user.role}.`,
      })
      // Route based on role from backend, not button
      if (res.data.user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/member/dashboard")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed")
      toast({
        title: "Login Failed",
        description: err.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotMsg("")
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email: forgotEmail })
      setForgotMsg("If this email exists, a reset link has been sent.")
    } catch (err: any) {
      setForgotMsg(err.response?.data?.message || "Error sending reset email")
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://res.cloudinary.com/ddkkfumkl/video/upload/v1749255174/istockphoto-2156510638-640_adpp_is_bdikbk.mp4" type="video/mp4" />
      </video>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />
      {/* Form Content */}
      <div className="relative z-20 w-full max-w-md mx-auto p-8 bg-white/90 rounded-xl shadow-xl backdrop-blur-md">
        {/* Back to Home Button */}
        <div className="w-full max-w-md mb-4 flex justify-center">
          <Link href="/landing">
            <Button variant="outline" className="border-2 border-sacco-blue text-sacco-blue bg-white hover:bg-sacco-blue hover:text-white font-semibold shadow-md">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="w-full max-w-md border border-sacco-blue">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-sacco-blue rounded-full">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-sacco-blue">SaccoSmart</CardTitle>
            <CardDescription>Sign in to your SACCO account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            {error && <div className="text-red-500">{error}</div>}
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                onClick={() => handleLogin("member")}
                disabled={isLoading}
                className="bg-sacco-blue hover:bg-sacco-blue/90"
              >
                {isLoading ? "Signing in..." : "Login as Member"}
              </Button>
              <Button
                onClick={() => handleLogin("admin")}
                disabled={isLoading}
                variant="outline"
                className="border-sacco-green text-sacco-green hover:bg-sacco-green hover:text-white"
              >
                {isLoading ? "Signing in..." : "Login as Admin"}
              </Button>
            </div>
            <div className="text-center space-y-2">
              <button
                type="button"
                className="text-sm text-sacco-blue hover:underline bg-transparent border-0"
                onClick={() => setShowForgot(true)}
              >
                Forgot your password?
              </button>
              <p className="text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/auth/register" className="text-sacco-blue hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
        {/* Forgot Password Modal */}
        {showForgot && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
              <h2 className="text-xl font-bold mb-2">Reset Password</h2>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
                <Button type="submit" disabled={forgotLoading} className="w-full">
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                {forgotMsg && <div className="text-sm text-center text-sacco-blue">{forgotMsg}</div>}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    setShowForgot(false)
                    setForgotMsg("")
                    setForgotEmail("")
                  }}
                >
                  Cancel
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
