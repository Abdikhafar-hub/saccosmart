"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import axios from "axios"

const columns = [
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "createdAt", label: "Uploaded Date", render: (v: string) => new Date(v).toLocaleDateString() },
  {
    key: "filePath",
    label: "Download",
    render: (v: string, row: any) => (
      <a href={`/${v.replace(/\\/g, "/")}`} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </a>
    )
  }
]

export default function MemberDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:5000/api/documents/member", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setDocuments(res.data)
      } catch (err) {
        setError("Failed to load documents")
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  // Filter by search and type
  const filtered = documents.filter(doc =>
    (doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.type.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter ? doc.type === typeFilter : true)
  )

  // Get unique types for filter dropdown
  const types = Array.from(new Set(documents.map(doc => doc.type)))

  return (
    <DashboardLayout role="member" user={{ name: "Member", email: "member@sacco.com", role: "member" }}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-gray-600">View and download SACCO documents and policies</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <DataTable columns={columns} data={filtered} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}