import { DatabaseManager } from './database'
import { Transaction } from './crypto-utils'

export interface PortfolioStats {
  totalValue: number
  totalReceived: number
  totalSent: number
  totalFees: number
  transactionCount: number
  avgTransactionValue: number
  profit: number
  profitPercentage: number
  monthlyChange: number
  monthlyChangePercentage: number
  recentActivity: {
    last24h: number
    last7d: number
    last30d: number
  }
}

export class PortfolioAnalyzer {
  static calculatePortfolioStats(walletAddress: string): PortfolioStats {
    const allTransactions = DatabaseManager.getTransactionsForAddress(walletAddress)
    const currentBalance = DatabaseManager.calculateBalance(walletAddress)
    
    // Separate incoming and outgoing transactions
    const incomingTx = allTransactions.filter(tx => 
      tx.to === walletAddress && tx.status === 'confirmed'
    )
    const outgoingTx = allTransactions.filter(tx => 
      tx.from === walletAddress && tx.status === 'confirmed'
    )
    
    // Calculate totals
    const totalReceived = incomingTx.reduce((sum, tx) => sum + tx.amount, 0)
    const totalSent = outgoingTx.reduce((sum, tx) => sum + tx.amount, 0)
    const totalFees = outgoingTx.reduce((sum, tx) => sum + tx.fee, 0)
    
    // Calculate transaction metrics
    const transactionCount = allTransactions.length
    const avgTransactionValue = transactionCount > 0 
      ? (totalReceived + totalSent) / transactionCount 
      : 0
    
    // Calculate profit (total received minus total sent minus fees)
    const profit = totalReceived - totalSent - totalFees
    const profitPercentage = totalSent > 0 ? (profit / totalSent) * 100 : 0
    
    // Calculate time-based metrics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))
    
    // Recent activity
    const recentActivity = {
      last24h: this.calculateActivityInPeriod(allTransactions, oneDayAgo, now),
      last7d: this.calculateActivityInPeriod(allTransactions, sevenDaysAgo, now),
      last30d: this.calculateActivityInPeriod(allTransactions, thirtyDaysAgo, now)
    }
    
    // Monthly change calculation
    const thirtyDaysTransactions = allTransactions.filter(tx => 
      new Date(tx.timestamp) >= thirtyDaysAgo
    )
    
    const monthlyIncoming = thirtyDaysTransactions
      .filter(tx => tx.to === walletAddress && tx.status === 'confirmed')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    const monthlyOutgoing = thirtyDaysTransactions
      .filter(tx => tx.from === walletAddress && tx.status === 'confirmed')
      .reduce((sum, tx) => sum + tx.amount + tx.fee, 0)
    
    const monthlyChange = monthlyIncoming - monthlyOutgoing
    const previousBalance = currentBalance - monthlyChange
    const monthlyChangePercentage = previousBalance > 0 
      ? (monthlyChange / previousBalance) * 100 
      : 0
    
    return {
      totalValue: currentBalance,
      totalReceived,
      totalSent,
      totalFees,
      transactionCount,
      avgTransactionValue,
      profit,
      profitPercentage,
      monthlyChange,
      monthlyChangePercentage,
      recentActivity
    }
  }
  
  private static calculateActivityInPeriod(
    transactions: Transaction[], 
    startDate: Date, 
    endDate: Date
  ): number {
    return transactions.filter(tx => {
      const txDate = new Date(tx.timestamp)
      return txDate >= startDate && txDate <= endDate && tx.status === 'confirmed'
    }).length
  }
  
  static getTransactionHistory(walletAddress: string, days: number = 30) {
    const allTransactions = DatabaseManager.getTransactionsForAddress(walletAddress)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Filter transactions within the specified period
    const periodTransactions = allTransactions.filter(tx => 
      new Date(tx.timestamp) >= startDate && tx.status === 'confirmed'
    )
    
    // Group by day and calculate daily balance changes
    const dailyData: { [date: string]: { sent: number, received: number, balance: number } } = {}
    
    let runningBalance = DatabaseManager.calculateBalance(walletAddress)
    
    // Process transactions in reverse chronological order to calculate historical balance
    const sortedTransactions = [...periodTransactions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    // Calculate balance at each point in time
    for (const tx of sortedTransactions) {
      const dateKey = new Date(tx.timestamp).toISOString().split('T')[0]
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { sent: 0, received: 0, balance: runningBalance }
      }
      
      if (tx.to === walletAddress) {
        dailyData[dateKey].received += tx.amount
        runningBalance -= tx.amount // Subtract to get historical balance
      } else if (tx.from === walletAddress) {
        dailyData[dateKey].sent += tx.amount + tx.fee
        runningBalance += tx.amount + tx.fee // Add back to get historical balance
      }
    }
    
    // Convert to array format for charting
    return Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        sent: data.sent,
        received: data.received,
        balance: data.balance,
        netChange: data.received - data.sent
      }))
  }
  
  static getTransactionSummary(walletAddress: string) {
    const allTransactions = DatabaseManager.getTransactionsForAddress(walletAddress)
    const pendingTransactions = DatabaseManager.getPendingTransactions()
      .filter(tx => tx.from === walletAddress || tx.to === walletAddress)
    
    const confirmed = allTransactions.filter(tx => tx.status === 'confirmed')
    const pending = pendingTransactions.filter(tx => tx.status === 'pending')
    
    return {
      total: allTransactions.length + pending.length,
      confirmed: confirmed.length,
      pending: pending.length,
      failed: allTransactions.filter(tx => tx.status === 'failed').length
    }
  }
}
