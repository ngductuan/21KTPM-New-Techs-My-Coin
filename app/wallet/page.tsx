"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wallet,
  Send,
  TrendingUp,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Activity,
  Loader,
  RefreshCw
} from "lucide-react"

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

interface WalletInfo {
  address: string
  balance: number
  created: string
  transactions: {
    total: number
    sent: number
    received: number
    totalSent: number
    totalReceived: number
    recent: Transaction[]
  }
}

export default function WalletPage() {
  const router = useRouter()
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [usdValue, setUsdValue] = useState(0)

  // Send functionality states
  const [recipient, setRecipient] = useState("")
  const [sendAmount, setSendAmount] = useState("")
  const [gasPrice, setGasPrice] = useState("0.001")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [sendError, setSendError] = useState("")

  // Transaction history states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    const walletAddress = localStorage.getItem('currentWalletAddress')
    if (!walletAddress) {
      router.push('/')
      return
    }

    console.log("pass here")

    try {
      setLoading(true)
      const response = await fetch(`/api/wallet/${walletAddress}`)
      const data = await response.json()

      console.log(`Loaded wallet success: ${JSON.stringify(data.data)}`);

      if (data.success) {
        console.log(`Loaded wallet: ${JSON.stringify(data.data)}`);
        setWalletInfo(data.data)
        setUsdValue(data.data.balance * 2) // Mock USD conversion rate
        
        // Load all transactions
        await loadTransactions(walletAddress)
      } else {
        console.error('Failed to load wallet:', data.error)
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading wallet:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadTransactions = async (address: string) => {
    try {
      setTransactionsLoading(true)
      const response = await fetch(`/api/transactions?address=${address}&limit=100`)
      const data = await response.json()

      if (data.success) {
        setAllTransactions(data.data.transactions)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setTransactionsLoading(false)
    }
  }

  const refreshData = () => {
    loadWalletData()
  }

  const estimatedFee = parseFloat(gasPrice) * 21000

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const canSend = walletInfo &&
    recipient &&
    sendAmount &&
    isValidAddress(recipient) &&
    parseFloat(sendAmount) > 0 &&
    parseFloat(sendAmount) + estimatedFee <= walletInfo.balance

  const handleSend = async () => {
    if (!walletInfo || !canSend) return

    // For demo purposes, we need a private key. In real implementation, 
    // this would come from secure storage or user input
    const privateKeyPrompt = prompt("Enter your private key to sign the transaction:")
    if (!privateKeyPrompt) return

    setIsLoading(true)
    setSendError("")

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: walletInfo.address,
          to: recipient,
          amount: parseFloat(sendAmount),
          privateKey: privateKeyPrompt,
          gasPrice: parseFloat(gasPrice)
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowConfirmation(true)
        setRecipient("")
        setSendAmount("")
        
        // Refresh wallet data
        await loadWalletData()

        setTimeout(() => {
          setShowConfirmation(false)
        }, 3000)
      } else {
        setSendError(data.error || 'Failed to send transaction')
      }
    } catch (error) {
      console.error('Error sending transaction:', error)
      setSendError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getTransactionType = (tx: Transaction, walletAddress: string) => {
    return tx.to === walletAddress ? 'receive' : 'send'
  }

  const filteredTransactions = allTransactions.filter((tx) => {
    if (!walletInfo) return false
    
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase())

    const txType = getTransactionType(tx, walletInfo.address)
    const matchesFilter = selectedFilter === "all" || 
                         txType === selectedFilter || 
                         tx.status === selectedFilter

    return matchesSearch && matchesFilter
  })

  if (loading || !walletInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm p-8">
          <CardContent className="flex items-center space-x-4">
            <Loader className="w-8 h-8 animate-spin" />
            <span className="text-lg">Loading wallet...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate statistics
  const totalReceived = walletInfo.transactions.totalReceived
  const totalSent = walletInfo.transactions.totalSent
  const pendingTransactions = allTransactions.filter((tx) => tx.status === "pending").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500">
      {/* Header */}
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/30 !bg-blue-500">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
              <span className="text-white font-bold text-xl">MyCoin Wallet</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
                <Wallet className="w-4 h-4 text-white" />
                <span className="font-mono text-sm text-white">{formatAddress(walletInfo.address)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(walletInfo.address)}
                  className="h-6 w-6 p-0 text-white hover:bg-white/10"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshData}
                  className="h-6 w-6 p-0 text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Success Notification */}
        {showConfirmation && (
          <div className="fixed top-4 right-4 z-50">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="flex items-center space-x-2 p-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700 font-medium">Transaction sent successfully!</span>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="send">Send Coins</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Balance Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="h-6 w-6 p-0"
                  >
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{showBalance ? `${walletInfo.balance.toLocaleString()} MYC` : "••••••"}</div>
                  <p className="text-xs text-muted-foreground">
                    {showBalance ? `≈ $${usdValue.toLocaleString()} USD` : "••••••"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                  <ArrowDownLeft className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+{totalReceived} MYC</div>
                  <p className="text-xs text-muted-foreground">All time received</p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">-{totalSent} MYC</div>
                  <p className="text-xs text-muted-foreground">All time sent</p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Activity className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{pendingTransactions}</div>
                  <p className="text-xs text-muted-foreground">Pending transactions</p>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Performance */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Portfolio Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+5.2%</div>
                    <p className="text-sm text-gray-600">24h Change</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">+12.8%</div>
                    <p className="text-sm text-gray-600">7d Change</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">+45.3%</div>
                    <p className="text-sm text-gray-600">30d Change</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Transactions</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.querySelector('[value="history"]')?.click()}
                  >
                    View All
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletInfo.transactions.recent.slice(0, 3).map((tx) => {
                    const txType = getTransactionType(tx, walletInfo.address)
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              txType === "receive" ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            {txType === "receive" ? (
                              <ArrowDownLeft className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{txType === "receive" ? "Received" : "Sent"}</div>
                            <div className="text-xs text-gray-500">{formatDate(tx.timestamp)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${txType === "receive" ? "text-green-600" : "text-red-600"}`}>
                            {txType === "receive" ? "+" : "-"}
                            {tx.amount} MYC
                          </div>
                          <Badge variant={tx.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Send MyCoin</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Balance Display */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Available Balance</div>
                  <div className="text-2xl font-bold text-gray-900">{walletInfo.balance} MYC</div>
                  <div className="text-sm text-gray-500">≈ ${usdValue.toLocaleString()} USD</div>
                </div>

                {/* Send Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="0x..."
                      className="font-mono"
                    />
                    {recipient && !isValidAddress(recipient) && (
                      <p className="text-sm text-red-600 mt-1">Invalid address format</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount (MYC)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.000001"
                      max={walletInfo.balance}
                    />
                    {sendAmount && parseFloat(sendAmount) > walletInfo.balance && (
                      <p className="text-sm text-red-600 mt-1">Insufficient balance</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
                    <Input
                      id="gasPrice"
                      type="number"
                      value={gasPrice}
                      onChange={(e) => setGasPrice(e.target.value)}
                      placeholder="20"
                    />
                  </div>
                </div>

                {/* Transaction Summary */}
                {sendAmount && recipient && isValidAddress(recipient) && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <h3 className="font-medium text-gray-900">Transaction Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{sendAmount} MYC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Network Fee:</span>
                        <span className="font-medium">{estimatedFee} MYC</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">
                          {(parseFloat(sendAmount) + estimatedFee).toFixed(6)} MYC
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {sendError && (
                  <Alert variant="destructive">
                    <AlertDescription>{sendError}</AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Double-check the recipient address. Transactions cannot be reversed.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleSend} disabled={!canSend || isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Transaction"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
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

            {/* Transactions List */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((tx) => {
                    const txType = getTransactionType(tx, walletInfo.address)
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
