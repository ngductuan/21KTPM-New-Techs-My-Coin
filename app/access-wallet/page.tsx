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
import { ArrowLeft, Key, FileText, Upload } from "lucide-react"
import Link from "next/link"

export default function AccessWalletPage() {
  const router = useRouter()
  const [privateKey, setPrivateKey] = useState("")
  const [mnemonic, setMnemonic] = useState("")
  const [walletFile, setWalletFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")

  const handlePrivateKeyAccess = () => {
    if (privateKey.length === 66 && privateKey.startsWith("0x")) {
      // Simulate successful access
      router.push("/wallet")
    }
  }

  const handleMnemonicAccess = () => {
    if (mnemonic.trim().split(" ").length === 12) {
      // Simulate successful access
      router.push("/wallet")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setWalletFile(file)
    }
  }

  const handleFileAccess = () => {
    if (walletFile && password) {
      // Simulate successful access
      router.push("/wallet")
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
                    <Input
                      id="privateKey"
                      type="password"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      placeholder="Enter your private key (0x...)"
                      className="font-mono"
                    />
                  </div>
                  <Alert>
                    <AlertDescription>
                      Your private key should start with "0x" and be 66 characters long.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handlePrivateKeyAccess} disabled={!privateKey} className="w-full">
                    Access Wallet
                  </Button>
                </TabsContent>

                <TabsContent value="mnemonic" className="space-y-4 p-4">
                  <div>
                    <Label htmlFor="mnemonic" className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <span>Mnemonic Phrase</span>
                    </Label>
                    <Textarea
                      id="mnemonic"
                      value={mnemonic}
                      onChange={(e) => setMnemonic(e.target.value)}
                      placeholder="Enter your 12-word mnemonic phrase"
                      className="font-mono"
                      rows={3}
                    />
                  </div>
                  <Alert>
                    <AlertDescription>Enter your 12-word mnemonic phrase separated by spaces.</AlertDescription>
                  </Alert>
                  <Button onClick={handleMnemonicAccess} disabled={!mnemonic} className="w-full">
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
