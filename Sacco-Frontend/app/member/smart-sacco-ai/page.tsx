"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send, RefreshCw, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import axios from "axios"

interface Message {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: Date
  file?: {
    name: string
    type: string
    url: string
  }
}

export default function SmartSaccoAI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)

  // Load saved messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("sacco-ai-chat")
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch (error) {
        console.error("Failed to parse saved messages", error)
      }
    }
  }, [])

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("sacco-ai-chat", JSON.stringify(messages))
    }
  }, [messages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch user info on mount (similar to dashboard)
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
      }
    }
    fetchUser()
  }, [])

  // Replace getAIResponse with backend fetch
  const getAIResponse = async (userInput: string) => {
    try {
      const res = await fetch("https://saccosmart.onrender.com/api/ai/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await res.json();
      if (data.response) {
        return data.response;
      } else if (data.error) {
        return "AI Error: " + data.error;
      } else {
        return "No response from AI.";
      }
    } catch (err) {
      return "Network error contacting AI.";
    }
  }

  // Update handleSendMessage to await AI response
  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // Await AI response from backend
    const aiText = await getAIResponse(input)
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: aiText,
      sender: "ai",
      timestamp: new Date()
    }
    setMessages(prev => [...prev, aiResponse])
    setLoading(false)
  }

  const handleRefresh = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([])
      localStorage.removeItem("sacco-ai-chat")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload the file to your server
    const fileMessage: Message = {
      id: Date.now().toString(),
      text: `Uploaded file: ${file.name}`,
      sender: "user",
      timestamp: new Date(),
      file: {
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      }
    }

    setMessages(prev => [...prev, fileMessage])
    setLoading(true)

    // Simulate AI response to file upload
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `I've received your ${file.type.split('/')[0]} file. I'll review it and get back to you.`,
        sender: "ai",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setLoading(false)
    }, 1500)
  }

  if (!user) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <DashboardLayout role="member" user={user}>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-400 shadow-md">
          <div className="flex-1 flex justify-center">
            <h2 className="text-2xl font-extrabold font-sans text-white tracking-wide">Smart Sacco AI</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-800 ml-auto"
            onClick={handleRefresh}
            style={{ boxShadow: 'none' }}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 bg-white dark:bg-gray-900 px-4 py-6 space-y-4 overflow-y-auto transition-all duration-300" style={{ scrollBehavior: 'smooth' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <Bot className="h-10 w-10 mb-2 text-blue-500" />
              <h3 className="text-lg font-semibold">How can I help you today?</h3>
              <p className="text-sm">Ask about me financial management, account management, loans, contributions or anything you want to know</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl shadow-md px-5 py-3 max-w-xs md:max-w-md break-words",
                    message.sender === "user"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                  )}
                  style={{ borderRadius: '1.25rem', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)' }}
                >
                  {message.file ? (
                    <div className="flex flex-col">
                      <span>{message.text}</span>
                      <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center">
                          <Paperclip className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm truncate">{message.file.name}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>{message.text}</p>
                  )}
                  <p className="text-xs mt-1 opacity-70 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-md px-5 py-3 text-gray-800 dark:text-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-500"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)' }}
            />
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-green-500 text-white font-bold rounded-2xl px-6 py-2 shadow-md transition-colors duration-200"
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              style={{ fontWeight: 700 }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}