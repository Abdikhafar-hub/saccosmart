"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"


import {
  Building2,
  CreditCard,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Zap,
  Globe,
  Clock,
  TrendingUp,
  Award,
  HeadphonesIcon,
  Send,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChatModal } from '@/components/ChatModal'

// Animated Counter Component
function AnimatedCounter({
  end,
  duration = 4000,
  decimals = 0,
  suffix = "",
  prefix = "",
}: {
  end: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
}) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const countRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = end * easeOutQuart

      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, end, duration])

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals)
    }
    return Math.floor(num).toLocaleString()
  }

  return (
    <div ref={countRef} className="text-3xl lg:text-4xl font-bold text-sacco-blue mb-2">
      {prefix}
      {formatNumber(count)}
      {suffix}
    </div>
  )
}

// Dashboard Video Component
function DashboardVideo() {
  return (
    <div className="relative">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="relative">
          <img
            src="https://res.cloudinary.com/ddkkfumkl/image/upload/v1748623932/Screenshot_from_2025-05-30_19-50-20_fk2oe2.png"
            alt="SaccoSmart Dashboard"
            className="w-full h-auto rounded-xl shadow-2xl"
            style={{
              maxWidth: "100%",
              height: "auto",
              aspectRatio: "16/10",
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Blog data (sample, Kenyan financial sector)
const blogs = [
  {
    title: "Economic Slowdown Amid Fiscal Challenges",
    summary: "The World Bank has revised Kenya's 2025 economic growth forecast downward to 4.5%, citing high public debt levels (65.5% of GDP), elevated lending rates, and a contraction in private sector credit. Key sectors such as manufacturing, finance, and mining are experiencing reduced credit availability and increased bad loans, particularly among smaller banks. The government's heavy reliance on domestic borrowing is crowding out private sector investment, leading to a decline in economic growth from 5.7% in 2023 to 4.7% in 2024.",
    author: "Reuters",
    date: "May 27, 2025",
    image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1749252395/World-Bank-1024x570-1_cnnfpx.jpg",
    link: "https://www.reuters.com/world/africa/world-bank-cuts-kenyas-2025-growth-forecast-private-sector-squeezed-2025-05-27/?utm_source=chatgpt.com"
  },
  {
    title: "Digital Transformation of SACCOs Faces Hurdles",
    summary: "While digital innovations are reshaping the SACCO experience in Kenya, many SACCOs face significant barriers to fintech adoption. Financial constraints are a primary challenge, as upgrading to modern banking platforms or integrating new apps requires substantial investment. Smaller SACCOs often rely on affordable ERP systems like Microsoft Dynamics, which need frequent updates, adding to the cost. Technical expertise is another limitation, with difficulties in hiring and retaining skilled IT staff, especially outside Nairobi. Legacy systems further complicate matters, making the integration of new fintech tools with old infrastructure a costly and time-consuming process.",
    author: "Africa Digest News",
    date: "May 13, 2025",
    image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1749252579/digital_transformation-1-e1682926918539_yngs2u.webp",
    link: "https://fintechnews.co.ke/sacco-digital-transformation-are-kenyan-saccos-ready-for-fintech/?utm_source=chatgpt.com"
  },
  {
    title: "Shift in Startup Funding from Fintech to Cleantech and Agri-Tech",
    summary: "Kenya's startup funding landscape in 2025 has seen a significant shift, with cleantech and agri-tech sectors attracting more investment than fintech. Cleantech alone accounted for 46% of total funding, with notable investments in companies like d.light ($176M), BasiGo ($42M), and M-Kopa ($51M). This shift indicates a diversification in the investment landscape, suggesting that while fintech remains a strong sector, emerging industries are gaining traction among investors.",
    author: "Tech In Africa",
    date: "May 23, 2025",
    image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1749252647/image_d7959338002be2b31e88e2b07f4da718-758x505_ussk9z.jpg",
    link: "https://www.techinafrica.com/kenya-startup-funding-trends-2025/?utm_source=chatgpt.com"
  },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  const features = [
    {
      icon: CreditCard,
      title: "Easy Contributions",
      description: "Make seamless contributions via M-Pesa integration with instant confirmation and tracking.",
      image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1749245249/Imagempesa_xdqxjl.png"
    },
    {
      icon: Users,
      title: "Member Management",
      description: "Comprehensive member portal with role-based access for members, treasurers, and administrators.",
      image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1748623932/Screenshot_from_2025-05-30_19-50-20_fk2oe2.png"
    },
    {
      icon: BarChart3,
      title: "Financial Reports",
      description: "Generate detailed financial reports, statements, and analytics with export capabilities.",
      image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1749245585/rep_nt0ped.png"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your financial data is protected with enterprise-grade security and encryption.",
      image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1749245706/freepik__generate-for-me-an-image-of-a-secure-digital-vault__30434_ozlcn7.jpg"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Access your SACCO account anywhere with our fully responsive mobile-friendly platform.",
      image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1749245896/mob_oiimqb.png"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications for contributions, loan approvals, and important SACCO updates.",
      image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1749246088/IMG_01F761-B76F7D-260827-6C0FD2-044CBE-6FD165_icqbpk.png"
    },
  ]

  const benefits = [
    {
      icon: Globe,
      title: "Digital Transformation",
      description: "Transform your traditional SACCO operations into a modern digital platform",
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce manual processes and paperwork by up to 80% with automated workflows",
    },
    {
      icon: TrendingUp,
      title: "Increase Growth",
      description: "Attract more members and increase engagement with user-friendly digital services",
    },
    {
      icon: Award,
      title: "Improve Transparency",
      description: "Provide members with real-time access to their financial information and SACCO updates",
    },
  ]

  const testimonials = [
    {
      name: "Mary Wanjiku",
      role: "SACCO Chairperson",
      company: "Umoja SACCO",
      content:
        "SaccoSmart has revolutionized how we manage our SACCO. Our members love the convenience of mobile contributions, and our administrative work has been reduced by 70%.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "John Kamau",
      role: "Treasurer",
      company: "Harambee SACCO",
      content:
        "The financial reporting features are incredible. We can now generate comprehensive reports in minutes instead of days. Our auditing process has never been smoother.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Grace Akinyi",
      role: "SACCO Member",
      company: "Unity SACCO",
      content:
        "I can now make my contributions from anywhere using M-Pesa. The mobile app is so easy to use, and I always know exactly where my money is going.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "KES 20,000",
      period: "/month",
      description: "Perfect for small SACCOs getting started",
      features: [
        "Up to 100 members",
        "Basic contribution management",
        "M-Pesa integration",
        "Basic reporting",
        "Email support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "KES 50,000",
      period: "/month",
      description: "Ideal for growing SACCOs",
      features: [
        "Up to 500 members",
        "Advanced loan management",
        "Custom reporting",
        "SMS notifications",
        "Priority support",
        "Mobile app access",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "KES 100,000",
      period: "/month",
      description: "For large SACCOs with complex needs",
      features: [
        "Unlimited members",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "Training & onboarding",
      ],
      popular: false,
    },
  ]

  // Array of background colors to cycle through for feature icons
  const iconColors = ['bg-sacco-blue', 'bg-sacco-green', 'bg-purple-600', 'bg-teal-600'];

  const heroSlides = [
    {
      image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1748609038/sac_ge83b4.png",
      title: "Modernize Your SACCO with Digital Excellence",
      description: "Transform your SACCO operations with our comprehensive management platform. Enable M-Pesa contributions, streamline loan processing, and provide members with 24/7 access to their accounts.",
      buttons: [
        { text: "Start Free Trial", href: "/auth/register", primary: true },
        { text: "Watch Demo", href: "#", primary: false },
      ],
    },
    {
      image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1749245585/rep_nt0ped.png",
      title: "Effortless Loan Management",
      description: "Approve, track, and manage loans with ease. Automate repayments, reduce defaults, and empower your members with instant loan access.",
      buttons: [
        { text: "Get Started", href: "/auth/register", primary: true },
      ],
    },
    {
      image: "https://res.cloudinary.com/ddkkfumkl/image/upload/v1749245896/mob_oiimqb.png",
      title: "Empower Your Members Anywhere",
      description: "Give your members secure, real-time access to their accounts, statements, and contributions from any device, anytime.",
      buttons: [
        { text: "Learn More", href: "#features", primary: true },
        { text: "Contact Us", href: "#contact", primary: false },
      ],
    },
  ];

  useEffect(() => {
    if (slideInterval.current) clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
        slideInterval.current = null;
      }
    };
  }, [heroSlides.length]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL in your environment variables.");
      }

      // Log the exact form data being sent
      console.log('Form data being sent:', {
        fullName: formData.fullName,
        emailAddress: formData.emailAddress,
        phoneNumber: formData.phoneNumber,
        message: formData.message
      });

      const response = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          emailAddress: formData.emailAddress,
          phoneNumber: formData.phoneNumber,
          message: formData.message
        }),
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (response.ok) {
        setSubmitMessage({ type: 'success', text: 'Message sent successfully!' });
        setFormData({
          fullName: '',
          emailAddress: '',
          phoneNumber: '',
          message: '',
        });
      } else {
        setSubmitMessage({ 
          type: 'error', 
          text: data.error || data.details || 'Failed to send message. Please try again later.' 
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-sacco-blue rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-sacco-blue">SaccoSmart</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-sacco-blue transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-sacco-blue transition-colors">
                Benefits
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-sacco-blue transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-sacco-blue transition-colors">
                Pricing
              </a>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="border-sacco-blue text-sacco-blue hover:bg-sacco-blue hover:text-white"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-sacco-blue hover:bg-sacco-blue/90">Get Started</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-sacco-blue">
                  Features
                </a>
                <a href="#benefits" className="block px-3 py-2 text-gray-600 hover:text-sacco-blue">
                  Benefits
                </a>
                <a href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-sacco-blue">
                  Testimonials
                </a>
                <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-sacco-blue">
                  Pricing
                </a>
                <div className="flex flex-col space-y-2 px-3 pt-2">
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full border-sacco-blue text-sacco-blue">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full bg-sacco-blue hover:bg-sacco-blue/90">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Carousel Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        style={{
              backgroundImage: `url('${slide.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            aria-hidden={currentSlide !== idx}
          >
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col lg:flex-row items-center justify-center min-h-screen">
              {/* Left: Text Content */}
              <div className="text-white flex-1 flex flex-col justify-center items-start">
              <Badge className="bg-white/20 text-white border-white/30 mb-6">
                🚀 Trusted by 500+ SACCOs across Kenya
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-shadow-lg">
                  {slide.title}
              </h1>
              <p className="text-xl lg:text-2xl text-white/95 mb-8 leading-relaxed text-shadow">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full sm:w-auto">
                  {slide.buttons.map((btn, bidx) =>
                    btn.primary ? (
                      <Link key={bidx} href={btn.href}>
                        <Button size="lg" className="bg-sacco-blue hover:bg-sacco-blue/90 text-white font-semibold px-8 shadow-lg">
                          {btn.text}
                          {btn.text.toLowerCase().includes('trial') && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </Link>
                    ) : (
                      <Link key={bidx} href={btn.href}>
                <Button
                  size="lg"
                  variant="outline"
                          className={`border-white text-white bg-white/20 hover:bg-white hover:text-sacco-blue font-semibold px-8 shadow-lg transition-colors duration-200 ${idx === 0 ? '' : 'hidden'}`}
                >
                          {btn.text}
                </Button>
                      </Link>
                    )
                  )}
              </div>
                {/* Feature Highlights */}
              <div className="flex items-center space-x-6 text-white/90">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-sacco-green" />
                  <span className="text-shadow">No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-sacco-green" />
                  <span className="text-shadow">30-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-sacco-green" />
                  <span className="text-shadow">24/7 support</span>
                </div>
              </div>
            </div>
              {/* Right: Dashboard/Relevant Image */}
              <div className="flex-1 flex justify-center items-center w-full lg:w-auto mt-12 lg:mt-0">
                {/* Only show DashboardVideo for first slide */}
                {idx === 0 ? (
            <DashboardVideo />
                ) : null}
          </div>
            </div>
          </div>
        ))}
        {/* Pagination Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${currentSlide === idx ? 'bg-sacco-blue border-sacco-blue scale-125' : 'bg-white/40'}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <AnimatedCounter end={500} duration={4000} suffix="+" />
              <div className="text-gray-600">SACCOs Served</div>
            </div>
            <div className="text-center">
              <AnimatedCounter end={50} duration={4000} suffix="K+" />
              <div className="text-gray-600">Active Members</div>
            </div>
            <div className="text-center">
              <AnimatedCounter end={2.0} duration={4000} decimals={1} prefix="KES " suffix="B+" />
              <div className="text-gray-600">Transactions Processed</div>
            </div>
            <div className="text-center">
              <AnimatedCounter end={99.9} duration={4000} decimals={1} suffix="%" />
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-sacco-blue mb-4">Everything Your SACCO Needs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive features designed specifically for SACCO operations, from member management to financial
              reporting.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="border-2 border-transparent rounded-lg shadow-md group bg-white hover:border-sacco-blue hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    {/* Feature Image */}
                    <div className="relative w-full h-32 overflow-hidden rounded-t-lg">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                  </div>
                    
                    {/* Icon and Title Row */}
                    <div className="flex items-center gap-4 p-6 pb-2">
                      <div className={`p-3 ${iconColors[index % iconColors.length]} rounded-lg transition-colors duration-300 group-hover:bg-sacco-green`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    </div>
                    
                    {/* Description */}
                    <div className="px-6 pb-6">
                      <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                    </div>
                </CardContent>
              </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-sacco-blue mb-4">Why Choose SaccoSmart?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join hundreds of SACCOs that have transformed their operations and improved member satisfaction with our
                platform.
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="border-2 border-transparent rounded-lg shadow-md group bg-white hover:border-sacco-blue hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-start space-x-4 p-6 rounded-lg">
                      <div className={`p-3 ${iconColors[index % iconColors.length]} rounded-lg`}>
                        <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                        <p className="text-gray-700">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Contributions</p>
                      <AnimatedCounter end={45} duration={4000} prefix="+" suffix="%" />
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Processing Time</p>
                      <AnimatedCounter end={80} duration={4000} prefix="-" suffix="%" />
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Loan Approvals</p>
                      <AnimatedCounter end={95} duration={4000} suffix="%" />
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Member Satisfaction</p>
                      <AnimatedCounter end={95} duration={4000} suffix="%" />
                    </div>
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-sacco-blue mb-4">Latest in Kenyan Finance</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest trends, news, and insights from Kenya's fast-evolving financial sector.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((blog, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group">
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 flex flex-col p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{blog.summary}</p>
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <span className="mr-2">By {blog.author}</span>
                    <span className="mx-2">•</span>
                    <span>{blog.date}</span>
                  </div>
                  <div className="mt-auto">
                    <a
                      href={blog.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-5 py-2 rounded-lg bg-sacco-blue text-white font-semibold hover:bg-sacco-blue/90 transition-colors"
                    >
                      Read More
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-sacco-blue mb-4">Trusted by SACCO Leaders</h2>
            <p className="text-xl text-gray-600">
              See what SACCO administrators and members are saying about SaccoSmart
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <Card className="border-0 shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-sacco-blue">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your SACCO's size and needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border rounded-lg transition-all duration-300 hover:scale-[1.02] ${plan.popular ? "border-sacco-blue shadow-xl scale-105 hover:shadow-2xl" : "border-gray-200 shadow-md hover:shadow-xl"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-sacco-blue text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-sacco-green" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular ? "bg-sacco-blue hover:bg-sacco-blue/90" : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-sacco-blue mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions or ready to get started? Contact us today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Map and Contact Info */}
            <div className="space-y-8">
              {/* Location and Contact Details */}
              <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                {/* Embedded Map */}
                <div className="aspect-video rounded-lg overflow-hidden mb-6">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.812711566962!2d36.786975776264136!3d-1.2864257356289606!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f118493ba1a95%3A0xa7510100f0ccfbb8!2sThe%20Arch%20Place!5e0!3m2!1sen!2ske!4v1749251383248!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                {/* Contact Info */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-6 w-6 text-sacco-blue flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Address</p>
                      <p className="text-gray-700">The Arch Place, 2nd Floor, Nyangumi Road,</p>
                      <p className="text-gray-700">Kilimani, Nairobi</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="h-6 w-6 text-sacco-blue flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Phone</p>
                      <p className="text-gray-700">+254 717 219 448</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Mail className="h-6 w-6 text-sacco-blue flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-700">info@smartsacco.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <h3 className="text-2xl font-bold text-sacco-blue mb-4">Send Us a Message</h3>
              <form className="space-y-6" onSubmit={handleFormSubmit}>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Your name" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input 
                    id="emailAddress" 
                    type="email" 
                    placeholder="Your email address" 
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    type="tel" 
                    placeholder="Your phone number" 
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Your message" 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-sacco-blue hover:bg-sacco-blue/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <div className="mt-8 text-center text-sm text-gray-600">
                Your message will be sent to our team via email.
              </div>
              {submitMessage && (
                <div className={`mt-4 p-3 rounded-md text-sm ${submitMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {submitMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
  className="py-20 bg-cover bg-center bg-no-repeat relative"
  style={{
    backgroundImage: "url('https://res.cloudinary.com/ddkkfumkl/image/upload/v1749253134/Advantages-of-Saccos_y6ocau.jpg')",
  }}
>
  {/* Overlay for readability */}
  <div className="absolute inset-0 bg-black/60"></div>

  <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Transform Your SACCO?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of SACCOs already using SaccoSmart to improve their operations and member satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-sm bg-white"
            />
            <Button size="lg" className="bg-white text-sacco-blue hover:bg-white/90 font-semibold px-8">
              Start Free Trial
            </Button>
          </div>
          <p className="text-white/80 text-sm">
            No credit card required • 30-day free trial • Setup assistance included
          </p>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-sacco-blue rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">SaccoSmart</span>
              </div>
              <p className="text-gray-400 mb-6">
                Empowering SACCOs across Kenya with modern digital solutions for better financial management.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            
            <div>
              <h3 className="font-semibold mb-6">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Training
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-6">Contact</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4" />
                  <span>+254 717 219 448</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4" />
                  <span>info@saccosmart.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4" />
                  <span>Nairobi, Kenya</span>
                </div>
                <div className="flex items-center space-x-3">
                  <HeadphonesIcon className="h-4 w-4" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 SaccoSmart. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .text-shadow-lg {
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  )
}
