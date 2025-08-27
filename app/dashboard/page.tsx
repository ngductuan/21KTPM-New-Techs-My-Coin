"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Coins, 
  Cpu, 
  TrendingUp, 
  Users, 
  Activity, 
  Clock, 
  RefreshCw, 
  Loader,
  Pickaxe,
  Network,
  Settings,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react"

interface NetworkStats {
  totalBlocks: number
  totalTransactions: number
  pendingTransactions: number
  totalSupply: number
  totalFees: number
  difficulty: number
  miningReward: number
  averageBlockTime: number
}

interface WalletStats {
  total: number
  topAddresses: Array<{
    address: string
    balance: number
    created: string
  }>
}

interface ActivityStats {
  transactionsLast24h: number
  volumeLast24h: number
  blocksLast24h: number
}

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
  fee: number
}

interface BlockchainData {
  network: NetworkStats
  wallets: WalletStats
  activity: ActivityStats
  latestBlock: any
  recentTransactions: Transaction[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null)
  const [loading, setLoading] = useState(true)
  const [miningLoading, setMiningLoading] = useState(false)
  const [miningSuccess, setMiningSuccess] = useState("")
  const [miningError, setMiningError] = useState("")
  const [currentWallet, setCurrentWallet] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
    const walletAddress = localStorage.getItem('currentWalletAddress')
    setCurrentWallet(walletAddress)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stats')
      const data = await response.json()

      if (data.success) {
        setBlockchainData(data.data)
      } else {
        console.error('Failed to load dashboard data:', data.error)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startMining = async () => {
    if (!currentWallet) {
      setMiningError("Please connect a wallet first")
      return
    }

    setMiningLoading(true)
    setMiningError("")
    setMiningSuccess("")

    try {
      const response = await fetch('/api/mining', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minerAddress: currentWallet
        })
      })

      const data = await response.json()

      if (data.success) {
        setMiningSuccess(`Block mined successfully! Reward: ${data.data.reward} MYC`)
        // Refresh dashboard data
        await loadDashboardData()
      } else {
        setMiningError(data.error || 'Failed to mine block')
      }
    } catch (error) {
      console.error('Error mining block:', error)
      setMiningError('Network error. Please try again.')
    } finally {
      setMiningLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  if (loading || !blockchainData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm p-8">
          <CardContent className="flex items-center space-x-4">
            <Loader className="w-8 h-8 animate-spin" />
            <span className="text-lg">Loading dashboard...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              <span className="text-white font-bold text-xl">MyCoin Dashboard</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/wallet">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Wallet className="w-4 h-4 mr-2" />
                  My Wallet
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Activity className="w-4 h-4 mr-2" />
                  Transactions
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDashboardData}
                className="text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Network Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
              <Network className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockchainData.network.totalBlocks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg time: {blockchainData.network.averageBlockTime}s
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
              <Coins className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockchainData.network.totalSupply} MYC</div>
              <p className="text-xs text-muted-foreground">
                Mining reward: {blockchainData.network.miningReward} MYC
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockchainData.network.pendingTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Total transactions: {blockchainData.network.totalTransactions.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Difficulty</CardTitle>
              <Cpu className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockchainData.network.difficulty}</div>
              <p className="text-xs text-muted-foreground">
                Mining complexity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mining Section */}
        <Card className="bg-white/95 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pickaxe className="w-5 h-5" />
              <span>Mining Operations</span>
            </CardTitle>
            <CardDescription>
              Mine new blocks and earn MyCoin rewards. Current reward: {blockchainData.network.miningReward} MYC per block.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!currentWallet && (
              <Alert>
                <AlertDescription>
                  Please connect a wallet to start mining. 
                  <Link href="/access-wallet" className="ml-2 text-blue-600 underline">
                    Connect Wallet
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            {miningSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-700">{miningSuccess}</AlertDescription>
              </Alert>
            )}

            {miningError && (
              <Alert variant="destructive">
                <AlertDescription>{miningError}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Start Mining</h4>
                <p className="text-sm text-gray-600">
                  {blockchainData.network.pendingTransactions} pending transactions ready to mine
                </p>
                {currentWallet && (
                  <p className="text-xs text-gray-500 font-mono">
                    Mining to: {formatAddress(currentWallet)}
                  </p>
                )}
              </div>
              <Button 
                onClick={startMining} 
                disabled={!currentWallet || miningLoading || blockchainData.network.pendingTransactions === 0}
                className="min-w-[120px]"
              >
                {miningLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Mining...
                  </>
                ) : (
                  <>
                    <Pickaxe className="w-4 h-4 mr-2" />
                    Mine Block
                  </>
                )}
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{blockchainData.activity.blocksLast24h}</div>
                <p className="text-sm text-gray-600">Blocks mined (24h)</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{blockchainData.activity.transactionsLast24h}</div>
                <p className="text-sm text-gray-600">Transactions (24h)</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{blockchainData.activity.volumeLast24h.toFixed(2)} MYC</div>
                <p className="text-sm text-gray-600">Volume (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link href="/transactions">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blockchainData.recentTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {formatAddress(tx.from)} → {formatAddress(tx.to)}
                        </div>
                        <div className="text-xs text-gray-500">{formatDate(tx.timestamp)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{tx.amount} MYC</div>
                      <Badge variant={tx.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {blockchainData.recentTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">No recent transactions</div>
              )}
            </CardContent>
          </Card>

          {/* Top Wallets */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Top Wallets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blockchainData.wallets.topAddresses.slice(0, 5).map((wallet, index) => (
                  <div key={wallet.address} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium font-mono text-sm">{formatAddress(wallet.address)}</div>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(wallet.created).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{wallet.balance.toLocaleString()} MYC</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  Total Wallets: <span className="font-semibold">{blockchainData.wallets.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Block Info */}
        {blockchainData.latestBlock && (
          <Card className="bg-white/95 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle>Latest Block</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Block Number</div>
                  <div className="font-mono font-semibold">{blockchainData.latestBlock.index}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Miner</div>
                  <div className="font-mono font-semibold">{formatAddress(blockchainData.latestBlock.miner)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Transactions</div>
                  <div className="font-semibold">{blockchainData.latestBlock.transactions.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Timestamp</div>
                  <div className="font-semibold">{formatDate(blockchainData.latestBlock.timestamp)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Hash</div>
                  <div className="font-mono font-semibold">{formatAddress(blockchainData.latestBlock.hash)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Reward</div>
                  <div className="font-semibold">{blockchainData.latestBlock.reward} MYC</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
