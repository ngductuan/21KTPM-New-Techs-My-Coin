"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Send, AlertTriangle, CheckCircle } from "lucide-react"

export default function SendPage() {
  const router = useRouter()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [gasPrice, setGasPrice] = useState("20")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const balance = 1250.75
  const estimatedFee = 0.001

  const handleSend = async () => {
    setIsLoading(true)
    // Simulate transaction processing
    setTimeout(() => {
      setIsLoading(false)
      setShowConfirmation(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    }, 3000)
  }

  const isValidAddress = (address: string) => {
    return address.length === 42 && address.startsWith("0x")
  }

  const canSend =
    recipient &&
    amount &&
    isValidAddress(recipient) &&
    Number.parseFloat(amount) > 0 &&
    Number.parseFloat(amount) <= balance

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Sent!</h2>
            <p className="text-gray-600 mb-4">Your transaction has been submitted to the network.</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
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
              <span className="text-gray-900 font-bold text-xl">MyCoin</span>
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
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Send MyCoin</span>
              </CardTitle>
              <CardDescription>Send MyCoin to another wallet address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Balance Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Available Balance</div>
                <div className="text-2xl font-bold text-gray-900">{balance} MYC</div>
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.000001"
                    max={balance}
                  />
                  {amount && Number.parseFloat(amount) > balance && (
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

                <div>
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Textarea
                    id="memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Add a note for this transaction"
                    rows={3}
                  />
                </div>
              </div>

              {/* Transaction Summary */}
              {amount && recipient && isValidAddress(recipient) && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-medium text-gray-900">Transaction Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{amount} MYC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network Fee:</span>
                      <span className="font-medium">{estimatedFee} MYC</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">{(Number.parseFloat(amount) + estimatedFee).toFixed(6)} MYC</span>
                    </div>
                  </div>
                </div>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Double-check the recipient address. Transactions cannot be reversed.
                </AlertDescription>
              </Alert>

              <Button onClick={handleSend} disabled={!canSend || isLoading} className="w-full">
                {isLoading ? "Sending..." : "Send Transaction"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
