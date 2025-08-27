"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Eye, EyeOff, Download, ArrowLeft, Shield, Key, FileText, Loader } from "lucide-react"
import Link from "next/link"

export default function CreateWalletPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [walletData, setWalletData] = useState({
    address: "",
    privateKey: "",
    publicKey: "",
    balance: 0,
    created: "",
  })

  const generatePassphrase = async () => {
    try {
      const response = await fetch('/api/utils/passphrase')
      const data = await response.json()
      if (data.success) {
        setPassphrase(data.data.passphrase)
      }
    } catch (error) {
      console.error('Error generating passphrase:', error)
    }
  }

  const generateWallet = async () => {
    if (!password || password !== confirmPassword || !agreedToTerms) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passphrase: passphrase || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        setWalletData({
          address: data.data.address,
          privateKey: data.data.privateKey, // Store the private key to display to user
          publicKey: data.data.publicKey,
          balance: data.data.balance,
          created: data.data.created,
        })
        
        // Store wallet address in localStorage for later access
        localStorage.setItem('currentWalletAddress', data.data.address)
        
        setStep(2)
      } else {
        setError(data.error || 'Failed to create wallet')
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadWallet = () => {
    const walletInfo = {
      address: walletData.address,
      publicKey: walletData.publicKey,
      privateKey: walletData.privateKey, // Include private key in download
      passphrase: passphrase,
      createdAt: walletData.created,
      note: "⚠️ IMPORTANT: Keep your private key secure. Never share it with anyone. You need this to access your wallet."
    }

    const dataStr = JSON.stringify(walletInfo, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "mycoin-wallet.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
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
              <span className="text-white font-bold text-xl">MyCoin</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">Create New Wallet</CardTitle>
                <CardDescription>Create a new MyCoin wallet to store and manage your cryptocurrency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter a strong password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center justify-between mb-2">
                      <span>Passphrase (Optional)</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generatePassphrase}
                      >
                        Generate
                      </Button>
                    </Label>
                    <Textarea
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter or generate a passphrase for additional security"
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the Terms of Service and Privacy Policy
                    </Label>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your password encrypts your wallet. Make sure to use a strong password and store it safely.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={generateWallet}
                  disabled={!password || password !== confirmPassword || !agreedToTerms || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Creating Wallet...
                    </>
                  ) : (
                    'Create Wallet'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">Wallet Created Successfully!</CardTitle>
                <CardDescription>
                  Please save your wallet information securely. You'll need this to access your wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-red-200 bg-red-50">
                  <Shield className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    <strong>Critical:</strong> Save your private key securely! Without it, you cannot access your wallet or recover your funds. 
                    Anyone with your private key can control your wallet. Download the wallet file or copy the private key to a secure location.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <Key className="w-4 h-4" />
                      <span>Wallet Address</span>
                    </Label>
                    <div className="flex space-x-2">
                      <Input value={walletData.address} readOnly className="font-mono text-sm" />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(walletData.address)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4" />
                      <span>Public Key</span>
                    </Label>
                    <div className="flex space-x-2">
                      <Textarea value={walletData.publicKey} readOnly className="font-mono text-sm min-h-[100px]" />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(walletData.publicKey)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <Key className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 font-semibold">Private Key (Keep Secret!)</span>
                    </Label>
                    <div className="flex space-x-2">
                      <Textarea value={walletData.privateKey} readOnly className="font-mono text-sm min-h-[100px] border-red-200 bg-red-50" />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(walletData.privateKey)} className="border-red-200">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Never share your private key with anyone. You need this to access your wallet.
                    </p>
                  </div>

                  {passphrase && (
                    <div>
                      <Label className="flex items-center space-x-2 mb-2">
                        <FileText className="w-4 h-4" />
                        <span>Passphrase</span>
                      </Label>
                      <div className="flex space-x-2">
                        <Textarea value={passphrase} readOnly className="font-mono text-sm" />
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(passphrase)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Wallet Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Balance:</strong> {walletData.balance} MyCoin</p>
                      <p><strong>Created:</strong> {new Date(walletData.created).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={downloadWallet} variant="outline" className="flex-1 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download Wallet
                  </Button>
                  <Button onClick={() => router.push("/wallet")} className="flex-1">
                    Access Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
