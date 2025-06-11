"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Upload, Download, FileText, Calendar, User, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import axios from "axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Document {
  _id: string
  title: string
  type: string
  status: "active" | "inactive"
  filePath: string
  fileSize: number
  createdAt: string
  updatedAt: string
}

const columns = [
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "filePath", label: "File" },
  { key: "fileSize", label: "Size (KB)" },
  { key: "createdAt", label: "Created" },
  // ...add more as needed
]

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [isUploading, setIsUploading] = useState(false)
  const [search, setSearch] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [docTypes, setDocTypes] = useState<{ value: string, label: string }[]>([])

  // Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("https://saccosmart.onrender.com/api/documents", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setDocuments(res.data)
      } catch (err) {
        setError("Failed to load documents")
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  useEffect(() => {
    const fetchTypes = async () => {
      const token = localStorage.getItem("token")
      const res = await axios.get("https://saccosmart.onrender.com/api/documents/types", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDocTypes(res.data)
    }
    fetchTypes()
  }, [])

  // Upload document
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !title || !type) {
      setError("All fields are required")
      return
    }
    setIsUploading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", title)
      formData.append("type", type)
      formData.append("status", status)
      await axios.post("https://saccosmart.onrender.com/api/documents", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      })
      setTitle("")
      setType("")
      setStatus("active")
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      // Refresh documents
      const res = await axios.get("https://saccosmart.onrender.com/api/documents", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDocuments(res.data)
    } catch (err) {
      setError("Failed to upload document")
    } finally {
      setIsUploading(false)
    }
  }

  // Delete document
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`https://saccosmart.onrender.com/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDocuments(docs => docs.filter(doc => doc._id !== id))
    } catch (err) {
      setError("Failed to delete document")
    }
  }

  // Filtered documents
  const filteredDocuments = documents.filter(
    doc =>
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.type.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner fullScreen />
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <DashboardLayout
      role="admin"
      user={{
        name: "Admin User",
        email: "admin@sacco.com",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "admin"
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">Manage SACCO legal documents and policies</p>
          </div>
        </div>

        {/* Document Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sacco-blue">{documents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {documents.filter((doc) => doc.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Document Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{new Set(documents.map((doc) => doc.type)).size}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">6.3 MB</div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
            <CardDescription>All uploaded SACCO documents and policies</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="mb-6 flex flex-col md:flex-row gap-4 items-center">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <input
                type="text"
                placeholder="Type (e.g. policy, legal)"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="border rounded px-2 py-1"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="border rounded px-2 py-1"
                accept=".pdf,.doc,.docx"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </form>
            <input
              type="text"
              placeholder="Search by title or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-2 py-1 mb-4 w-full"
            />
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {loading ? (
              <div>Loading...</div>
            ) : (
              <DataTable columns={columns} data={filteredDocuments} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
