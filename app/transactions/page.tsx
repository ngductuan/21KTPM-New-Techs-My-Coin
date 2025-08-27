"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, ExternalLink, ArrowUpRight, ArrowDownLeft, Download, Loader, RefreshCw } from "lucide-react"

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  timestamp: string
  signature: string
  status: 'pending' | 'confirmed' | 'failed'
  blockHash?: string
  blockNumber?: number
  gasUsed: number
  gasPrice: number
  fee: number
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWallet, setCurrentWallet] = useState<string | null>(null)

  useEffect(() => {
    loadTransactions()
    const walletAddress = localStorage.getItem('currentWalletAddress')
    setCurrentWallet(walletAddress)
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions?limit=100')
      const data = await response.json()

      if (data.success) {
        setTransactions(data.data.transactions)
      } else {
        console.error('Failed to load transactions:', data.error)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const getTransactionType = (tx: Transaction, walletAddress: string | null) => {
    if (!walletAddress) return 'unknown'
    return tx.to === walletAddress ? 'receive' : 'send'
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase())

    const txType = getTransactionType(tx, currentWallet)
    const matchesFilter = selectedFilter === "all" || 
                         txType === selectedFilter || 
                         tx.status === selectedFilter

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex items-center space-x-4">
            <Loader className="w-8 h-8 animate-spin" />
            <span className="text-lg">Loading transactions...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                    placeholder="Search by transaction ID, address..."
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
                <Button variant="outline" size="sm" onClick={loadTransactions}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
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
              {filteredTransactions.map((tx) => {
                const txType = getTransactionType(tx, currentWallet)
                return (
                  <div key={tx.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            txType === "receive" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {txType === "receive" ? (
                            <ArrowDownLeft className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{txType === "receive" ? "Received" : "Sent"}</span>
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
                              ID:
                              <span className="font-mono ml-1">{formatHash(tx.id)}</span>
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
                            {tx.blockNumber && tx.blockNumber > 0 && (
                              <div>
                                Block: <span className="font-mono">{tx.blockNumber.toLocaleString()}</span>
                              </div>
                            )}
                            <div>
                              Fee: <span className="font-mono">{tx.fee} MYC</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(tx.timestamp)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-medium ${txType === "receive" ? "text-green-600" : "text-red-600"}`}
                        >
                          {txType === "receive" ? "+" : "-"}
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
                )
              })}
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
