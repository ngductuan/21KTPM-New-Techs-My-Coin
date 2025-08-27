import { DatabaseManager } from './database'
import { Transaction } from './crypto-utils'

export class TransactionProcessor {
  private static instance: TransactionProcessor
  private processingQueue = new Map<string, NodeJS.Timeout>()

  private constructor() {
    // No need to initialize DatabaseManager since it's static
  }

  static getInstance(): TransactionProcessor {
    if (!TransactionProcessor.instance) {
      TransactionProcessor.instance = new TransactionProcessor()
    }
    return TransactionProcessor.instance
  }

  /**
   * Start processing a pending transaction - automatically confirm after 5 seconds
   */
  async processTransaction(transactionId: string): Promise<void> {
    const data = DatabaseManager.readTransactionsDB()
    const pendingTx = data.pendingTransactions?.find((tx: Transaction) => tx.id === transactionId)
    
    if (!pendingTx) {
      console.error(`Pending transaction ${transactionId} not found`)
      return
    }

    console.log(`Processing transaction ${transactionId} - will confirm in 5 seconds`)

    // Set a timeout to automatically confirm the transaction after 5 seconds
    const timeoutId = setTimeout(async () => {
      await this.confirmTransaction(transactionId)
    }, 5000) // 5 seconds

    this.processingQueue.set(transactionId, timeoutId)
  }

  /**
   * Confirm a pending transaction - move to confirmed transactions and update balances
   */
  async confirmTransaction(transactionId: string): Promise<boolean> {
    try {
      const data = DatabaseManager.readTransactionsDB()
      const pendingTxIndex = data.pendingTransactions?.findIndex((tx: Transaction) => tx.id === transactionId)
      
      if (pendingTxIndex === -1 || pendingTxIndex === undefined) {
        console.error(`Pending transaction ${transactionId} not found`)
        return false
      }

      const pendingTx = data.pendingTransactions[pendingTxIndex]
      
      // Check if sender has sufficient balance (including gas fee)
      const senderWallet = DatabaseManager.getWallet(pendingTx.from)
      const totalCost = pendingTx.amount + pendingTx.fee
      
      if (!senderWallet || senderWallet.balance < totalCost) {
        console.error(`Insufficient balance for transaction ${transactionId}`)
        // Mark as failed and remove from pending
        data.pendingTransactions.splice(pendingTxIndex, 1)
        DatabaseManager.writeTransactionsDB(data)
        return false
      }

      // Move transaction from pending to confirmed
      const confirmedTx = {
        ...pendingTx,
        status: 'confirmed' as const,
        timestamp: new Date().toISOString() // Update confirmation timestamp
      }

      // Add to confirmed transactions
      data.transactions.push(confirmedTx)
      data.pendingTransactions.splice(pendingTxIndex, 1)

      // Save to database
      DatabaseManager.writeTransactionsDB(data)

      // Clear from processing queue
      const timeoutId = this.processingQueue.get(transactionId)
      if (timeoutId) {
        clearTimeout(timeoutId)
        this.processingQueue.delete(transactionId)
      }

      console.log(`Transaction ${transactionId} confirmed successfully`)
      return true
    } catch (error) {
      console.error(`Error confirming transaction ${transactionId}:`, error)
      return false
    }
  }

  /**
   * Cancel a pending transaction
   */
  async cancelTransaction(transactionId: string): Promise<boolean> {
    try {
      const data = DatabaseManager.readTransactionsDB()
      const pendingTxIndex = data.pendingTransactions?.findIndex((tx: Transaction) => tx.id === transactionId)
      
      if (pendingTxIndex === -1 || pendingTxIndex === undefined) {
        return false
      }

      // Remove from pending transactions
      data.pendingTransactions.splice(pendingTxIndex, 1)
      DatabaseManager.writeTransactionsDB(data)

      // Clear timeout
      const timeoutId = this.processingQueue.get(transactionId)
      if (timeoutId) {
        clearTimeout(timeoutId)
        this.processingQueue.delete(transactionId)
      }

      console.log(`Transaction ${transactionId} cancelled`)
      return true
    } catch (error) {
      console.error(`Error cancelling transaction ${transactionId}:`, error)
      return false
    }
  }

  /**
   * Get all pending transactions for a wallet
   */
  getPendingTransactions(walletAddress?: string): Transaction[] {
    const data = DatabaseManager.readTransactionsDB()
    const pending = data.pendingTransactions || []
    
    if (walletAddress) {
      return pending.filter((tx: Transaction) => tx.from === walletAddress || tx.to === walletAddress)
    }
    
    return pending
  }

  /**
   * Check transaction status
   */
  getTransactionStatus(transactionId: string): 'pending' | 'confirmed' | 'not_found' {
    const data = DatabaseManager.readTransactionsDB()
    
    // Check pending transactions
    const pendingTx = data.pendingTransactions?.find((tx: Transaction) => tx.id === transactionId)
    if (pendingTx) {
      return 'pending'
    }
    
    // Check confirmed transactions
    const confirmedTx = data.transactions?.find((tx: Transaction) => tx.id === transactionId)
    if (confirmedTx) {
      return 'confirmed'
    }
    
    return 'not_found'
  }
}
