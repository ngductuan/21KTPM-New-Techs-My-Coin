"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Transaction {
  id: string
  type: "send" | "receive"
  amount: number
  from: string
  to: string
  timestamp: Date
  status: "confirmed" | "pending" | "failed"
  hash: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [balance, setBalance] = useState(1250.75)
  const [usdValue, setUsdValue] = useState(2501.5)
  const [walletAddress] = useState("0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4")
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "receive",
      amount: 100,
      from: "0x123...abc",
      to: walletAddress,
      timestamp: new Date("2024-01-15T10:30:00"),
      status: "confirmed",
      hash: "0xabc123...",
    },
    {
      id: "2",
      type: "send",
      amount: 50,
      from: walletAddress,
      to: "0x456...def",
      timestamp: new Date("2024-01-14T15:45:00"),
      status: "confirmed",
      hash: "0xdef456...",
    },
    {
      id: "3",
      type: "receive",
      amount: 200,
      from: "0x789...ghi",
      to: walletAddress,
      timestamp: new Date("2024-01-13T09:15:00"),
      status: "confirmed",
      hash: "0xghi789...",
    },
  ])

  useEffect(() => {
    // Redirect to the comprehensive wallet page
    router.push("/wallet")
  }, [router])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 flex items-center justify-center">
      <div className="text-white text-lg">Redirecting to wallet...</div>
    </div>
  )
}
