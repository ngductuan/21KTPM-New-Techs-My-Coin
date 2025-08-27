"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Key, FileText, Upload, Loader } from "lucide-react"
import Link from "next/link"

export default function AccessWalletPage() {
  const router = useRouter()
  const [privateKey, setPrivateKey] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [walletFile, setWalletFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePrivateKeyAccess = async () => {
    if (!privateKey.trim()) {
      setError("Please enter your private key")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/wallet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privateKey: privateKey.trim(),
          passphrase: passphrase.trim() || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        // Store wallet address in localStorage
        localStorage.setItem('currentWalletAddress', data.data.address)
        router.push("/wallet")
      } else {
        setError(data.error || 'Failed to access wallet')
      }
    } catch (error) {
      console.error('Error accessing wallet:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMnemonicAccess = () => {
    setError("Mnemonic phrase access is not yet implemented. Please use private key access.")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setWalletFile(file)
      setError("")
    }
  }

  const handleFileAccess = async () => {
    if (!walletFile) {
      setError("Please select a wallet file")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const fileContent = await walletFile.text()
      const walletData = JSON.parse(fileContent)

      if (walletData.address) {
        // Check if wallet exists in our system
        const response = await fetch(`/api/wallet/${walletData.address}`)
        const data = await response.json()

        if (data.success) {
          localStorage.setItem('currentWalletAddress', walletData.address)
          router.push("/wallet")
        } else {
          setError('Wallet not found in the system')
        }
      } else {
        setError('Invalid wallet file format')
      }
    } catch (error) {
      console.error('Error reading wallet file:', error)
      setError('Invalid wallet file or network error')
    } finally {
      setIsLoading(false)
    }
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
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Access Your Wallet</CardTitle>
              <CardDescription>Choose a method to access your existing MyCoin wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="private-key" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="private-key">Private Key</TabsTrigger>
                  <TabsTrigger value="mnemonic">Mnemonic</TabsTrigger>
                  <TabsTrigger value="keystore">Keystore File</TabsTrigger>
                </TabsList>

                <TabsContent value="private-key" className="space-y-4 p-4">
                  <div>
                    <Label htmlFor="privateKey" className="flex items-center space-x-2 mb-2">
                      <Key className="w-4 h-4" />
                      <span>Private Key</span>
                    </Label>
                    <Textarea
                      id="privateKey"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      placeholder="Enter your private key"
                      className="font-mono min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passphrase">Passphrase (Optional)</Label>
                    <Input
                      id="passphrase"
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter passphrase if used during wallet creation"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Alert>
                    <AlertDescription>
                      Enter your private key to access your wallet. Never share your private key with anyone.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={handlePrivateKeyAccess} 
                    disabled={!privateKey || isLoading} 
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Accessing Wallet...
                      </>
                    ) : (
                      'Access Wallet'
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="mnemonic" className="space-y-4 p-4">
                  <div>
                    <Label htmlFor="mnemonic" className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <span>Passphrase</span>
                    </Label>
                    <Textarea
                      id="passphrase-input"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter your passphrase"
                      className="font-mono"
                      rows={3}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Alert>
                    <AlertDescription>
                      Enter your passphrase to access your wallet. This feature is currently limited.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleMnemonicAccess} disabled={!passphrase} className="w-full">
                    Access Wallet
                  </Button>
                </TabsContent>

                <TabsContent value="keystore" className="space-y-4 p-4">
                  <div>
                    <Label htmlFor="walletFile" className="flex items-center space-x-2 mb-2">
                      <Upload className="w-4 h-4" />
                      <span>Keystore File</span>
                    </Label>
                    <Input
                      id="walletFile"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                    {walletFile && <p className="text-sm text-gray-600">Selected: {walletFile.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="filePassword">Password</Label>
                    <Input
                      id="filePassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter wallet password"
                    />
                  </div>
                  <Alert>
                    <AlertDescription>
                      Upload your keystore file and enter the password used when creating the wallet.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleFileAccess} disabled={!walletFile || !password} className="w-full">
                    Access Wallet
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
