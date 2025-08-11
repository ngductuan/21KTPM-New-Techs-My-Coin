"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, ExternalLink, ArrowUpRight, ArrowDownLeft, Download } from "lucide-react"

interface Transaction {
  id: string
  hash: string
  type: "send" | "receive"
  amount: number
  from: string
  to: string
  timestamp: Date
  status: "confirmed" | "pending" | "failed"
  blockNumber: number
  gasUsed: number
  gasPrice: number
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const transactions: Transaction[] = [
    {
      id: "1",
      hash: "0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
      type: "receive",
      amount: 100,
      from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      to: "0x123456789abcdef123456789abcdef123456789a",
      timestamp: new Date("2024-01-15T10:30:00"),
      status: "confirmed",
      blockNumber: 18500123,
      gasUsed: 21000,
      gasPrice: 20,
    },
    {
      id: "2",
      hash: "0xdef456ghi789jkl012mno345pqr678stu901vwx234yz567abc",
      type: "send",
      amount: 50,
      from: "0x123456789abcdef123456789abcdef123456789a",
      to: "0x987654321fedcba987654321fedcba987654321f",
      timestamp: new Date("2024-01-14T15:45:00"),
      status: "confirmed",
      blockNumber: 18499876,
      gasUsed: 21000,
      gasPrice: 18,
    },
    {
      id: "3",
      hash: "0xghi789jkl012mno345pqr678stu901vwx234yz567abc123def",
      type: "receive",
      amount: 200,
      from: "0x456789abcdef123456789abcdef123456789abcdef1",
      to: "0x123456789abcdef123456789abcdef123456789a",
      timestamp: new Date("2024-01-13T09:15:00"),
      status: "confirmed",
      blockNumber: 18498654,
      gasUsed: 21000,
      gasPrice: 22,
    },
    {
      id: "4",
      hash: "0xjkl012mno345pqr678stu901vwx234yz567abc123def456ghi",
      type: "send",
      amount: 25,
      from: "0x123456789abcdef123456789abcdef123456789a",
      to: "0xabcdef123456789abcdef123456789abcdef123456",
      timestamp: new Date("2024-01-12T14:20:00"),
      status: "pending",
      blockNumber: 0,
      gasUsed: 0,
      gasPrice: 25,
    },
  ]

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = selectedFilter === "all" || tx.type === selectedFilter || tx.status === selectedFilter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">MyCoin Explorer</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Transaction Explorer</CardTitle>
            <CardDescription>Search and filter your MyCoin transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by hash, address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="send">Sent</TabsTrigger>
                    <TabsTrigger value="receive">Received</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "receive" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {tx.type === "receive" ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{tx.type === "receive" ? "Received" : "Sent"}</span>
                          <Badge
                            variant={
                              tx.status === "confirmed"
                                ? "default"
                                : tx.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>
                            Hash:
                            <span className="font-mono ml-1">{formatHash(tx.hash)}</span>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                          <div>
                            From: <span className="font-mono">{formatAddress(tx.from)}</span>
                          </div>
                          <div>
                            To: <span className="font-mono">{formatAddress(tx.to)}</span>
                          </div>
                          {tx.blockNumber > 0 && (
                            <div>
                              Block: <span className="font-mono">{tx.blockNumber.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{formatDate(tx.timestamp)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-medium ${tx.type === "receive" ? "text-green-600" : "text-red-600"}`}
                      >
                        {tx.type === "receive" ? "+" : "-"}
                        {tx.amount} MYC
                      </div>
                      {tx.status === "confirmed" && (
                        <div className="text-sm text-gray-600">
                          Gas: {tx.gasUsed.toLocaleString()} @ {tx.gasPrice} Gwei
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">No transactions found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
