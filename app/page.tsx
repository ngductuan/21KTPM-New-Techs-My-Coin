"use client"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Smartphone, Globe, Key, Shield, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500">
      {/* Header */}
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/30 !bg-blue-500">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
              <span className="text-white font-bold text-xl">MyCoin</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Buy Crypto
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Swap Tokens
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                More features
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Resources
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                Products
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Access my wallet</h1>
          <p className="text-white/80 text-lg mb-2">Please select a method to access your wallet.</p>
          <p className="text-white/80">
            {"Don't have a wallet? "}
            <Link href="/create-wallet" className="text-emerald-400 hover:text-emerald-300 underline">
              Create Wallet
            </Link>
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Wallet Options */}
          <Link href="/access-wallet">
            <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Key className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Private Key</h3>
                      <p className="text-gray-600 text-sm">Access with your private key</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">Official</div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <div className="py-1"></div>

          <Link href="/access-wallet">
            <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">MyCoin wallet app</h3>
                      <p className="text-gray-600 text-sm">Connect MyCoin Wallet app to MyCoin web</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">Official</div>
                </div>
              </CardContent>
            </Card>
          </Link>

           <div className="py-1"></div>     

          <Link href="/access-wallet">
            <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Browser extension</h3>
                    <p className="text-gray-600 text-sm">Use your Web3 wallet with MyCoin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <div className="py-1"></div>

          <Link href="/access-wallet">
            <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Mobile Apps</h3>
                    <p className="text-gray-600 text-sm">WalletConnect, WalletLink</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Secure Wallet</h3>
            <p className="text-white/70">Create and manage your MyCoin wallet with advanced security features</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Track Portfolio</h3>
            <p className="text-white/70">Monitor your MyCoin balance and transaction history in real-time</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Fast Transactions</h3>
            <p className="text-white/70">Send MyCoin to any address quickly and securely</p>
          </div>
        </div>
      </main>
    </div>
  )
}
